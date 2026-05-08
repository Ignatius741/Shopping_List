require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Set default JWT secret if not in .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'my_super_secret_key_for_jwt_12345';
  console.log('⚠️ Using default JWT secret. Set JWT_SECRET in .env for production!');
}

// Import routes
const authRoutes = require('./backend/routes/auth.routes');
const itemRoutes = require('./backend/routes/item.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start JSON Server programmatically
const jsonServer = require('json-server');
const jsonServerApp = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

jsonServerApp.use(middlewares);
jsonServerApp.use('/data', router);

const JSON_SERVER_PORT = process.env.JSON_SERVER_PORT || 5000;
jsonServerApp.listen(JSON_SERVER_PORT, () => {
  console.log(`📦 JSON Server running on http://localhost:${JSON_SERVER_PORT}`);
});

// Start main Express server
app.listen(PORT, () => {
  console.log(`🚀 Main server running on http://localhost:${PORT}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET.substring(0, 10)}...`);
});

console.log('\n✅ To get started:');
console.log('1. Open http://localhost:3000');
console.log('2. Click "Sign up" to create a new account');
console.log('3. Then login with your new account\n');