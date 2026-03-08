const Driver = require('../models/Driver');
const User = require('../models/User');
const Ride = require('../models/Ride');

// @desc    Get driver profile
// @route   GET /api/drivers/profile
// @access  Private (Driver)
const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate('user', '-password');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver profile'
    });
  }
};

// @desc    Update driver profile
// @route   PUT /api/drivers/profile
// @access  Private (Driver)
const updateDriverProfile = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, vehicleModel, vehicleColor, bankDetails } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      { vehicleType, vehicleNumber, vehicleModel, vehicleColor, bankDetails },
      { new: true, runValidators: true }
    ).populate('user', '-password');

    res.json({
      success: true,
      message: 'Driver profile updated successfully',
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update driver profile'
    });
  }
};

// @desc    Update driver location
// @route   PUT /api/drivers/location
// @access  Private (Driver)
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, address } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          address
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: driver.currentLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

// @desc    Toggle driver availability
// @route   PUT /api/drivers/availability
// @access  Private (Driver)
const toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.json({
      success: true,
      message: `Driver is now ${driver.isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: driver.isAvailable }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle availability'
    });
  }
};

// @desc    Get driver earnings
// @route   GET /api/drivers/earnings
// @access  Private (Driver)
const getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    // Get completed rides for detailed earnings
    const rides = await Ride.find({
      driver: driver._id,
      status: 'completed',
      paymentStatus: 'completed'
    }).populate('user', 'name');

    const earningsData = {
      totalEarnings: driver.earnings,
      totalRides: driver.totalRides,
      averagePerRide: driver.totalRides > 0 ? (driver.earnings / driver.totalRides).toFixed(2) : 0,
      recentRides: rides.slice(0, 10)
    };

    res.json({
      success: true,
      data: earningsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings'
    });
  }
};

// @desc    Get nearby drivers (for admin/user)
// @route   GET /api/drivers/nearby
// @access  Private
const getNearbyDrivers = async (req, res) => {
  try {
    const { longitude, latitude, vehicleType, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    const query = {
      isAvailable: true,
      isVerified: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) // in meters
        }
      }
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    const drivers = await Driver.find(query)
      .limit(10)
      .populate('user', 'name phone profileImage');

    res.json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby drivers'
    });
  }
};

// @desc    Get all drivers (Admin)
// @route   GET /api/drivers
// @access  Private (Admin)
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('user', 'name email phone');

    res.json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers'
    });
  }
};

// @desc    Verify driver (Admin)
// @route   PUT /api/drivers/:id/verify
// @access  Private (Admin)
const verifyDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Driver verified successfully',
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify driver'
    });
  }
};

module.exports = {
  getDriverProfile,
  updateDriverProfile,
  updateLocation,
  toggleAvailability,
  getEarnings,
  getNearbyDrivers,
  getAllDrivers,
  verifyDriver
};
