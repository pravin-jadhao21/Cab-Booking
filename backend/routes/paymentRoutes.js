const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPayment,
  getUserPayments,
  getPaymentByRide,
  getReceipt,
  processRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, authorize('user'), processPayment);
router.get('/my-payments', protect, authorize('user'), getUserPayments);

// Common routes
router.get('/:id', protect, getPayment);
router.get('/ride/:rideId', protect, getPaymentByRide);
router.get('/:id/receipt', protect, getReceipt);

// Admin routes
router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
