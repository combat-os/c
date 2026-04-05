// backend/src/server.js
// Main Express server with modular architecture

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { loadModules, registerModules } from './modules/moduleLoader.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'COMBAT OS Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Legacy routes (will be phased out)
// app.use('/api/auth', authRoutes);
// app.use('/api/logs', optionalAuthMiddleware, logsRoutes);

// Health status with module info
app.get('/api/status', (req, res) => {
  const modules = {
    // Legacy modules
    personnel: process.env.MODULE_PERSONNEL === 'true',
    qr_scan: process.env.MODULE_QR_SCAN === 'true',
    exit_form: process.env.MODULE_EXIT_FORM === 'true',
    photo_upload: process.env.MODULE_PHOTO_UPLOAD === 'true',
    logistics: process.env.MODULE_LOGISTICS === 'true',
    security: process.env.MODULE_SECURITY === 'true',
    training: process.env.MODULE_TRAINING === 'true',

    // New modular architecture
    auth: process.env.MODULE_AUTH !== 'false', // Default enabled
    pos: process.env.MODULE_POS !== 'false', // Default enabled
    qr: process.env.MODULE_QR !== 'false', // Default enabled
    logs: process.env.MODULE_LOGS !== 'false', // Default enabled
    alerts: process.env.MODULE_ALERTS !== 'false', // Default enabled
  };

  res.status(200).json({
    success: true,
    message: 'COMBAT OS Backend Status',
    environment: process.env.NODE_ENV || 'development',
    modules,
    timestamp: new Date().toISOString(),
  });
});

// Initialize and load modules
async function startServer() {
  try {
    console.log('🚀 Starting COMBAT OS Backend...');
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Load modular components
    const modules = await loadModules();

    // Register module routes
    registerModules(app, modules);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`\n📖 API Documentation:`);
      console.log(`   - POST   /api/auth/login        - Login with NRP`);
      console.log(`   - GET    /api/auth/verify       - Verify token`);
      console.log(`   - GET    /api/logs              - Fetch scan logs`);
      console.log(`   - GET    /health                - Health check`);
      console.log(`   - GET    /api/status            - System status & modules`);
      console.log(`\n🔧 Enabled Modules:`);
      Object.entries(modules).forEach(([name]) => {
        console.log(`   ✓ ${name}`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
