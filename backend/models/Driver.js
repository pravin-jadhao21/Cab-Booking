const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true
  },
  vehicleType: {
    type: String,
    required: [true, 'Please provide vehicle type'],
    enum: ['mini', 'sedan', 'suv', 'premium']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
    unique: true
  },
  vehicleModel: {
    type: String,
    required: [true, 'Please provide vehicle model']
  },
  vehicleColor: {
    type: String,
    required: [true, 'Please provide vehicle color']
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  documents: {
    license: String,
    vehicleRC: String,
    insurance: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
