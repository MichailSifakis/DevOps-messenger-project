import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from './socket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
setIO(io);
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);

// Fallback route for React
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// Socket handlers
io.on('connection', (socket) => {
  socket.on('join', (code) => {
    if (code) socket.join(code);
  });
  socket.on('sendMessage', ({ fromCode, toCode, text }) => {
    if (!fromCode || !toCode || !text) return;
    io.to(toCode).emit('message', { id: `${Date.now()}`, fromCode, toCode, text, timestamp: Date.now() });
  });
});

// Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});