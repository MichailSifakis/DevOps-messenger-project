import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

// Fallback route for React
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});