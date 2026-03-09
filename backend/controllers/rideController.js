const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { calculateFare, calculateDistance, estimateDuration, generateOTP } = require('../utils/fareCalculator');

const createRide = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, vehicleType, paymentMethod, scheduledTime } = req.body;
    const distance = calculateDistance(pickupLocation.coordinates[1], pickupLocation.coordinates[0], dropLocation.coordinates[1], dropLocation.coordinates[0]);
    const duration = estimateDuration(distance);
    const fare = calculateFare(vehicleType, distance, duration);
    const otp = generateOTP();
    const ride = await Ride.create({
      user: req.user._id,
      pickupLocation: { type: 'Point', coordinates: pickupLocation.coordinates, address: pickupLocation.address },
      dropLocation: { type: 'Point', coordinates: dropLocation.coordinates, address: dropLocation.address },
      distance, duration, vehicleType, fare, paymentMethod, scheduledTime, otp, status: 'pending'
    });
    res.status(201).json({ success: true, message: 'Ride booked successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create ride' });
  }
};

const getFareEstimate = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, vehicleType } = req.body;
    const distance = calculateDistance(pickupLocation.coordinates[1], pickupLocation.coordinates[0], dropLocation.coordinates[1], dropLocation.coordinates[0]);
    const duration = estimateDuration(distance);
    const fare = calculateFare(vehicleType, distance, duration);
    res.json({ success: true, data: { distance, duration, fare } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate fare' });
  }
};

const acceptRide = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    if (!driver.isVerified) return res.status(403).json({ success: false, message: 'Driver not verified by admin yet' });
    if (!driver.isAvailable) return res.status(400).json({ success: false, message: 'Go online first to accept rides' });

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status !== 'pending') return res.status(400).json({ success: false, message: 'Ride is no longer available' });

    ride.driver = driver._id;
    ride.status = 'accepted';
    await ride.save();
    driver.isAvailable = false;
    await driver.save();
    await ride.populate('user', 'name phone');
    res.json({ success: true, message: 'Ride accepted successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to accept ride' });
  }
};

const startRide = async (req, res) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status !== 'accepted') return res.status(400).json({ success: false, message: 'Ride must be accepted first' });
    if (ride.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    ride.status = 'started';
    ride.startTime = new Date();
    await ride.save();
    res.json({ success: true, message: 'Ride started successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start ride' });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status !== 'started') return res.status(400).json({ success: false, message: 'Ride must be started first' });
    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();
    const driver = await Driver.findById(ride.driver);
    if (driver) { driver.totalRides += 1; driver.earnings += ride.fare.total; driver.isAvailable = true; await driver.save(); }
    res.json({ success: true, message: 'Ride completed successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete ride' });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { reason } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel completed ride' });
    ride.status = 'cancelled';
    ride.cancellationReason = reason || 'Cancelled';
    await ride.save();
    if (ride.driver) await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
    res.json({ success: true, message: 'Ride cancelled successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel ride' });
  }
};

const rateRide = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (ride.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only rate completed rides' });
    ride.rating = { value: rating, comment: comment || '' };
    await ride.save();
    const driver = await Driver.findById(ride.driver);
    if (driver) {
      const allRides = await Ride.find({ driver: driver._id, 'rating.value': { $exists: true, $ne: null } });
      const totalRating = allRides.reduce((sum, r) => sum + r.rating.value, 0);
      driver.rating = (totalRating / allRides.length).toFixed(2);
      await driver.save();
    }
    res.json({ success: true, message: 'Rating submitted successfully', data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
};

const getUserRides = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const rides = await Ride.find(query)
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rides' });
  }
};

// KEY FIX: Driver sees all pending rides (matching their vehicle type) + their own accepted/started/completed rides
const getDriverRides = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    // Pending rides available to accept (matching vehicle type, no driver assigned)
    const pendingRides = await Ride.find({ status: 'pending', driver: null, vehicleType: driver.vehicleType })
      .populate('user', 'name phone').sort({ createdAt: -1 });

    // This driver's own rides
    const myRides = await Ride.find({ driver: driver._id, status: { $in: ['accepted', 'started', 'completed', 'cancelled'] } })
      .populate('user', 'name phone').sort({ createdAt: -1 });

    const allRides = [...pendingRides, ...myRides];
    res.json({ success: true, count: allRides.length, data: allRides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rides' });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', 'name phone')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ride' });
  }
};

module.exports = { createRide, getFareEstimate, acceptRide, startRide, completeRide, cancelRide, rateRide, getUserRides, getDriverRides, getRideById };