const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketEvents = require('./utils/socketEvents');
const { verifyToken } = require('./utils/jwt');
require('./cronJobs/rideExpiry');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.set('socketEvents', socketEvents);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://cab-booking-ctfmd3no1-pravin-jadhao21s-projects.vercel.app"
  ],
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.get('/', (req, res) => {
  res.send('UCab Backend Running');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'UCab API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://cab-booking-ctfmd3no1-pravin-jadhao21s-projects.vercel.app"
    ],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Not authorized'));
  const decoded = verifyToken(token);
  if (!decoded) return next(new Error('Not authorized'));
  socket.userId = decoded.id;
  next();
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  socket.join(`user:${userId}`);
  socket.join(`uid:${userId}`);

  socket.emit('connected', { message: 'Socket connected' });

  socket.on('joinDriverRoom', (driverId) => {
    if (driverId) socket.join(`driver:${driverId}`);
  });

  socket.on('disconnect', () => {
    // cleanup can go here if needed
  });
});

socketEvents.on('rideUpdated', (ride) => {
  const rideRoom = `ride:${ride._id}`;
  io.to(rideRoom).emit('ride:update', ride);
  io.to(`user:${ride.user.toString()}`).emit('ride:update', ride);
  if (ride.driver) io.to(`driver:${ride.driver.toString()}`).emit('ride:update', ride);
});

socketEvents.on('driverLocationUpdated', ({ driverId, currentLocation, rideId, userId }) => {
  const payload = { driverId, currentLocation, rideId };
  if (rideId) io.to(`ride:${rideId}`).emit('driver:location', payload);
  io.to(`driver:${driverId}`).emit('driver:location', payload);
  if (userId) io.to(`user:${userId}`).emit('driver:location', payload);
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚗  UCab Backend Server Running                    ║
║                                                       ║
║   📡  Port: ${PORT}                                    ║
║   🌍  Environment: ${process.env.NODE_ENV || 'development'}                     ║
║   🔗  API: http://localhost:${PORT}/api              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
