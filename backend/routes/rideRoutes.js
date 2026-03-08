const express = require('express');
const router = express.Router();
const {
  createRide,
  getFareEstimate,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  rateRide,
  getUserRides,
  getDriverRides,
  getRideById
} = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, authorize('user'), createRide);
router.post('/estimate', protect, getFareEstimate);
router.get('/my-rides', protect, authorize('user'), getUserRides);
router.put('/:id/cancel', protect, cancelRide);
router.put('/:id/rate', protect, authorize('user'), rateRide);

// Driver routes
router.get('/driver-rides', protect, authorize('driver'), getDriverRides);
router.put('/:id/accept', protect, authorize('driver'), acceptRide);
router.put('/:id/start', protect, authorize('driver'), startRide);
router.put('/:id/complete', protect, authorize('driver'), completeRide);

// Common routes
router.get('/:id', protect, getRideById);

module.exports = router;
