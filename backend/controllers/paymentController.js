const Payment = require('../models/Payment');
const Ride = require('../models/Ride');

// @desc    Process payment
// @route   POST /api/payments
// @access  Private (User)
const processPayment = async (req, res) => {
  try {
    const { rideId, paymentMethod, cardDetails, upiDetails } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this ride'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only pay for completed rides'
      });
    }

    if (ride.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this ride'
      });
    }

    // Create payment record
    const paymentData = {
      ride: rideId,
      user: req.user._id,
      driver: ride.driver,
      amount: ride.fare.total,
      paymentMethod,
      status: 'completed',
      completedAt: new Date()
    };

    // Add payment method specific details
    if (paymentMethod === 'card' && cardDetails) {
      paymentData.cardDetails = {
        last4Digits: cardDetails.last4Digits,
        cardType: cardDetails.cardType
      };
      paymentData.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
    } else if (paymentMethod === 'upi' && upiDetails) {
      paymentData.upiDetails = {
        upiId: upiDetails.upiId
      };
      paymentData.transactionId = `UPI${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }

    const payment = await Payment.create(paymentData);

    // Update ride payment status
    ride.paymentStatus = 'completed';
    await ride.save();

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('ride')
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/my-payments
// @access  Private (User)
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('ride')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// @desc    Get payment by ride ID
// @route   GET /api/payments/ride/:rideId
// @access  Private
const getPaymentByRide = async (req, res) => {
  try {
    const payment = await Payment.findOne({ ride: req.params.rideId })
      .populate('ride')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this ride'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('ride')
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const receipt = {
      receiptNumber: payment.receipt.receiptNumber,
      generatedAt: payment.receipt.generatedAt,
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status
      },
      ride: {
        rideId: payment.ride._id,
        pickupAddress: payment.ride.pickupLocation.address,
        dropAddress: payment.ride.dropLocation.address,
        distance: payment.ride.distance,
        duration: payment.ride.duration,
        fareBreakdown: payment.ride.fare
      },
      user: {
        name: payment.user.name,
        email: payment.user.email,
        phone: payment.user.phone
      },
      driver: {
        name: payment.driver.user.name,
        phone: payment.driver.user.phone,
        vehicleNumber: payment.driver.vehicleNumber,
        vehicleModel: payment.driver.vehicleModel
      }
    };

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
};

// @desc    Process refund (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    payment.status = 'refunded';
    payment.refundDetails = {
      refundId: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
      refundAmount: refundAmount || payment.amount,
      refundReason,
      refundDate: new Date()
    };
    await payment.save();

    // Update ride payment status
    await Ride.findByIdAndUpdate(payment.ride, { paymentStatus: 'failed' });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

module.exports = {
  processPayment,
  getPayment,
  getUserPayments,
  getPaymentByRide,
  getReceipt,
  processRefund
};
