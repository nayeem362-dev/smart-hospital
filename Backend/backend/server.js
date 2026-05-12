/*const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Smart Hospital Backend Running");
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Smart Hospital API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/diagnostics', require('./routes/diagnostics'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/discharges', require('./routes/discharges'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🏥 Smart Hospital Management System`);
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`✅ Health: http://localhost:${PORT}/health\n`);
  });
};

startServer();

module.exports = app;