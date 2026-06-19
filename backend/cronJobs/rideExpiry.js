const cron = require('node-cron');
const Ride = require('../models/Ride');

console.log('Ride expiry cron job initialized');

cron.schedule('* * * * *', async () => {
  try {
    console.log('Cron running:', new Date());

    const result = await Ride.updateMany(
      {
        status: 'pending',
        rideRequestExpiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    console.log('Expired rides:', result.modifiedCount);

  } catch (err) {
    console.error('Ride expiry job failed:', err.message);
  }
});