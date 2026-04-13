const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const logRoutes = require('./routes/logs');
const analyticsRoutes = require('./routes/analytics');
const goalRoutes = require('./routes/goals');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const assignmentRoutes = require('./routes/assignments');
const examRoutes = require('./routes/exams');
const { cgpaRouter, ttRouter, notesRouter, gamRouter, roomRouter } = require('./routes/studentRoutes');

const app = express();


// 🔐 Security middleware
app.use(helmet());

// 🌐 CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
}));


// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
// ⚠️ Optional: comment this if debugging auth issues
app.use('/api/auth', authLimiter);


// 📦 Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// 📜 Logging (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// ❤️ Health check (ONLY ONE)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend working',
    timestamp: new Date().toISOString(),
  });
});


// 🚀 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/cgpa', cgpaRouter);
app.use('/api/timetable', ttRouter);
app.use('/api/notes', notesRouter);
app.use('/api/gamification', gamRouter);
app.use('/api/studyrooms', roomRouter);


// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// ⚠️ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


module.exports = app;