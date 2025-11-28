import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from './socket.js';
import { metricsMiddleware, getMetrics } from './middleware/metrics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/messenger';

console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
  });

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:5173',  // Dev
      'http://localhost',        // Docker
      'http://localhost:80'      // Docker explicit
    ],
    methods: ['GET', 'POST']
  }
});
setIO(io);

const PORT = process.env.PORT || 5000;

app.use(metricsMiddleware);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost',
    'http://localhost:80'
  ]
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', (code) => {
    socket.join(code);
    console.log(`User ${code} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});