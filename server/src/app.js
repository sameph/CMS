const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes.js');
const labRequestRoutes = require('./routes/labRequestRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const opdLabRequestRoutes = require('./routes/opdLabRequestRoutes.js');
const appointmentRoutes = require('./routes/appointmentRoutes.js');

const app = express();

// Middleware
// Configure CORS to allow only specified frontend origins
const allowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server requests or same-origin (no Origin header)
    if (!origin) return callback(null, true);
    // If no FRONTEND_ORIGINS provided, fall back to permissive to avoid blocking during development
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/opd/lab-requests', opdLabRequestRoutes);
app.use('/api/appointments', appointmentRoutes);




module.exports = app;
