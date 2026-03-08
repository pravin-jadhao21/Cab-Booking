const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { calculateFare, calculateDistance, estimateDuration, generateOTP } = require('../utils/fareCalculator');

// @desc    Create a new ride booking
// @route   POST /api/rides
// @access  Private (User)
const createRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      vehicleType,
      paymentMethod,
      scheduledTime
    } = req.body;

    // Calculate distance between pickup and drop
    const distance = calculateDistance(
      pickupLocation.coordinates[1],
      pickupLocation.coordinates[0],
      dropLocation.coordinates[1],
      dropLocation.coordinates[0]
    );

    // Estimate duration
    const duration = estimateDuration(distance);

    // Calculate fare
    const fare = calculateFare(vehicleType, distance, duration);

    // Generate OTP for ride verification
    const otp = generateOTP();

    // Create ride
    const ride = await Ride.create({
      user: req.user._id,
      pickupLocation: {
        type: 'Point',
        coordinates: pickupLocation.coordinates,
        address: pickupLocation.address
      },
      dropLocation: {
        type: 'Point',
        coordinates: dropLocation.coordinates,
        address: dropLocation.address
      },
      distance,
      duration,
      vehicleType,
      fare,
      paymentMethod,
      scheduledTime,
      otp,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      data: ride
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create ride'
    });
  }
};

// @desc    Get fare estimate
// @route   POST /api/rides/estimate
// @access  Private
const getFareEstimate = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, vehicleType } = req.body;

    const distance = calculateDistance(
      pickupLocation.coordinates[1],
      pickupLocation.coordinates[0],
      dropLocation.coordinates[1],
      dropLocation.coordinates[0]
    );

    const duration = estimateDuration(distance);
    const fare = calculateFare(vehicleType, distance, duration);

    res.json({
      success: true,
      data: {
        distance,
        duration,
        fare
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fare'
    });
  }
};

// @desc    Accept ride (Driver)
// @route   PUT /api/rides/:id/accept
// @access  Private (Driver)
const acceptRide = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    if (!driver.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Driver not verified. Please complete verification.'
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is not available'
      });
    }

    ride.driver = driver._id;
    ride.status = 'accepted';
    await ride.save();

    // Update driver availability
    driver.isAvailable = false;
    await driver.save();

    await ride.populate('user', 'name phone');

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept ride'
    });
  }
};

// @desc    Start ride (Driver)
// @route   PUT /api/rides/:id/start
// @access  Private (Driver)
const startRide = async (req, res) => {
  try {
    const { otp } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Ride must be accepted first'
      });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    ride.status = 'started';
    ride.startTime = new Date();
    await ride.save();

    res.json({
      success: true,
      message: 'Ride started successfully',
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start ride'
    });
  }
};

// @desc    Complete ride (Driver)
// @route   PUT /api/rides/:id/complete
// @access  Private (Driver)
const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({
        success: false,
        message: 'Ride must be started first'
      });
    }

    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();

    // Update driver stats
    const driver = await Driver.findById(ride.driver);
    driver.totalRides += 1;
    driver.earnings += ride.fare.total;
    driver.isAvailable = true;
    await driver.save();

    res.json({
      success: true,
      message: 'Ride completed successfully',
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete ride'
    });
  }
};

// @desc    Cancel ride
// @route   PUT /api/rides/:id/cancel
// @access  Private
const cancelRide = async (req, res) => {
  try {
    const { reason } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed ride'
      });
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason || 'User cancelled';
    await ride.save();

    // Make driver available again if ride was accepted
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ride'
    });
  }
};

// @desc    Rate ride
// @route   PUT /api/rides/:id/rate
// @access  Private (User)
const rateRide = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this ride'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }

    ride.rating = {
      value: rating,
      comment: comment || ''
    };
    await ride.save();

    // Update driver rating
    const driver = await Driver.findById(ride.driver);
    const allRides = await Ride.find({
      driver: driver._id,
      'rating.value': { $exists: true }
    });

    const totalRating = allRides.reduce((sum, r) => sum + r.rating.value, 0);
    driver.rating = (totalRating / allRides.length).toFixed(2);
    await driver.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
};

// @desc    Get user rides
// @route   GET /api/rides/my-rides
// @access  Private (User)
const getUserRides = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('driver')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone profileImage'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rides'
    });
  }
};

// @desc    Get driver rides
// @route   GET /api/rides/driver-rides
// @access  Private (Driver)
const getDriverRides = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const { status } = req.query;

    const query = { driver: driver._id };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('user', 'name phone profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rides'
    });
  }
};

// @desc    Get ride by ID
// @route   GET /api/rides/:id
// @access  Private
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', 'name phone profileImage')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone profileImage'
        }
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ride'
    });
  }
};

module.exports = {
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
};
