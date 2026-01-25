import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './utils/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import petsRoutes from './routes/pets.js';
import applicationsRoutes from './routes/applications.js';
import favoritesRoutes from './routes/favorites.js';
import appointmentsRoutes from './routes/appointments.js';
import quizRoutes from './routes/quiz.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
await initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🐾 Pet Adoption Portal API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
