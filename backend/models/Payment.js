const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // allows null values while maintaining uniqueness for non-null values
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  cardDetails: {
    last4Digits: String,
    cardType: String // visa, mastercard, etc.
  },
  upiDetails: {
    upiId: String
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundDate: Date
  },
  receipt: {
    receiptNumber: String,
    generatedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Generate receipt number before saving
paymentSchema.pre('save', function(next) {
  if (!this.receipt.receiptNumber) {
    this.receipt.receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    this.receipt.generatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
