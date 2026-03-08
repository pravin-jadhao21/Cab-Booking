// Fare calculation based on vehicle type and distance
const FARE_RATES = {
  mini: {
    baseFare: 50,
    perKm: 10,
    perMinute: 1
  },
  sedan: {
    baseFare: 80,
    perKm: 15,
    perMinute: 1.5
  },
  suv: {
    baseFare: 120,
    perKm: 20,
    perMinute: 2
  },
  premium: {
    baseFare: 200,
    perKm: 30,
    perMinute: 3
  }
};

const TAX_RATE = 0.05; // 5% tax

const calculateFare = (vehicleType, distance, duration) => {
  const rates = FARE_RATES[vehicleType] || FARE_RATES.mini;
  
  const baseFare = rates.baseFare;
  const distanceFare = distance * rates.perKm;
  const timeFare = duration * rates.perMinute;
  
  const subtotal = baseFare + distanceFare + timeFare;
  const tax = subtotal * TAX_RATE;
  const total = Math.round(subtotal + tax);
  
  return {
    baseFare,
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    tax: Math.round(tax),
    total
  };
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Estimate duration (simple calculation: avg speed 40 km/h)
const estimateDuration = (distance) => {
  const avgSpeed = 40; // km/h
  const hours = distance / avgSpeed;
  return Math.round(hours * 60); // Convert to minutes
};

// Generate OTP for ride verification
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = {
  calculateFare,
  calculateDistance,
  estimateDuration,
  generateOTP,
  FARE_RATES
};
