const express = require('express');
const router = express.Router();
const {
  getDriverProfile,
  updateDriverProfile,
  updateLocation,
  toggleAvailability,
  getEarnings,
  getNearbyDrivers,
  getAllDrivers,
  verifyDriver
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// Driver routes
router.get('/profile', protect, authorize('driver'), getDriverProfile);
router.put('/profile', protect, authorize('driver'), updateDriverProfile);
router.put('/location', protect, authorize('driver'), updateLocation);
router.put('/availability', protect, authorize('driver'), toggleAvailability);
router.get('/earnings', protect, authorize('driver'), getEarnings);

// Public/User accessible routes
router.get('/nearby', protect, getNearbyDrivers);

// Admin routes
router.get('/', protect, authorize('admin'), getAllDrivers);
router.put('/:id/verify', protect, authorize('admin'), verifyDriver);

module.exports = router;
