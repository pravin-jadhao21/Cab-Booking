# 🚗 UCab - Full-Stack Cab Booking System

A complete MERN stack cab booking application with real-time tracking, secure payments, and role-based access control.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Demo & Deployment](#demo--deployment)

## ✨ Features

### User Features
- 🔐 User registration and authentication (JWT-based)
- 📍 Real-time location-based cab search
- 💰 Fare estimation before booking
- 🚖 Book rides with multiple vehicle types (Mini, Sedan, SUV, Premium)
- 📱 OTP-based ride verification
- ⭐ Rate and review drivers
- 💳 Multiple payment methods (Cash, Card, UPI, Wallet)
- 📊 Booking history and receipts
- 🔔 Real-time ride status updates

### Driver Features
- 🚗 Driver registration and verification
- 📍 Real-time location updates
- 🟢 Toggle availability status
- 📞 Accept/decline ride requests
- 🎯 Navigate to pickup and drop locations
- 💵 Earnings tracking and analytics
- ⭐ Driver ratings and reviews
- 🏦 Bank details for payouts

### Admin Features
- 👥 User and driver management
- ✅ Driver verification system
- 📊 System analytics and reports
- 💰 Payment and refund management

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt.js for password hashing

**Key Features:**
- RESTful API architecture
- Role-based access control (RBAC)
- Geospatial queries for location-based features
- Secure password hashing
- Error handling middleware

## 📦 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ucab-backend.git
cd ucab-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
# Copy the example env file
cp .env.example .env

# Edit .env file with your configuration
```

### 4. Configure MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ucab
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ucab

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

⚠️ **Security Note:** Never commit your `.env` file to version control. Always use strong, unique values for `JWT_SECRET` in production.

## 🏃 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

### Verify the server is running
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "UCab API is running",
  "timestamp": "2024-01-XX..."
}
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "user"  // or "driver"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Ride Endpoints

#### Get Fare Estimate
```http
POST /api/rides/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupLocation": {
    "coordinates": [77.5946, 12.9716],  // [longitude, latitude]
    "address": "MG Road, Bangalore"
  },
  "dropLocation": {
    "coordinates": [77.6408, 12.9279],
    "address": "Whitefield, Bangalore"
  },
  "vehicleType": "sedan"
}
```

#### Book a Ride
```http
POST /api/rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupLocation": {
    "coordinates": [77.5946, 12.9716],
    "address": "MG Road, Bangalore"
  },
  "dropLocation": {
    "coordinates": [77.6408, 12.9279],
    "address": "Whitefield, Bangalore"
  },
  "vehicleType": "sedan",
  "paymentMethod": "cash"
}
```

#### Get My Rides
```http
GET /api/rides/my-rides?status=completed
Authorization: Bearer <token>
```

### Driver Endpoints

#### Get Nearby Drivers
```http
GET /api/drivers/nearby?longitude=77.5946&latitude=12.9716&vehicleType=sedan
Authorization: Bearer <token>
```

#### Update Driver Location
```http
PUT /api/drivers/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "longitude": 77.5946,
  "latitude": 12.9716,
  "address": "MG Road, Bangalore"
}
```

#### Toggle Availability
```http
PUT /api/drivers/availability
Authorization: Bearer <token>
```

### Payment Endpoints

#### Process Payment
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "rideId": "ride_id_here",
  "paymentMethod": "card",
  "cardDetails": {
    "last4Digits": "1234",
    "cardType": "visa"
  }
}
```

#### Get Receipt
```http
GET /api/payments/:paymentId/receipt
Authorization: Bearer <token>
```

## 📁 Project Structure

```
ucab-backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── driverController.js   # Driver management
│   ├── rideController.js     # Ride booking & tracking
│   └── paymentController.js  # Payment processing
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Driver.js            # Driver schema
│   ├── Ride.js              # Ride schema
│   └── Payment.js           # Payment schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── driverRoutes.js      # Driver endpoints
│   ├── rideRoutes.js        # Ride endpoints
│   └── paymentRoutes.js     # Payment endpoints
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── fareCalculator.js    # Fare calculation logic
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Entry point
└── README.md               # Documentation
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: ['user', 'driver', 'admin'],
  profileImage: String,
  address: Object,
  isActive: Boolean,
  createdAt: Date
}
```

### Drivers Collection
```javascript
{
  user: ObjectId (ref: User),
  licenseNumber: String (unique),
  vehicleType: ['mini', 'sedan', 'suv', 'premium'],
  vehicleNumber: String,
  currentLocation: GeoJSON Point,
  isAvailable: Boolean,
  isVerified: Boolean,
  rating: Number,
  totalRides: Number,
  earnings: Number
}
```

### Rides Collection
```javascript
{
  user: ObjectId (ref: User),
  driver: ObjectId (ref: Driver),
  pickupLocation: GeoJSON Point,
  dropLocation: GeoJSON Point,
  distance: Number,
  duration: Number,
  vehicleType: String,
  fare: Object,
  status: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
  paymentStatus: String,
  otp: String,
  rating: Object
}
```

## 🌐 Demo & Deployment

### For GitHub Repository

1. **Demo Link**: Deploy backend on:
   - [Railway](https://railway.app/)
   - [Render](https://render.com/)
   - [Heroku](https://www.heroku.com/)
   - [AWS EC2](https://aws.amazon.com/ec2/)

2. **Example Demo URL**:
   ```
   https://ucab-backend.railway.app
   ```

3. **GitHub Link**:
   ```
   https://github.com/your-username/ucab-backend
   ```

### Deployment Steps (Railway Example)

1. Create account on [Railway](https://railway.app/)
2. Install Railway CLI or use web interface
3. Create new project
4. Connect your GitHub repository
5. Add environment variables in Railway dashboard
6. Deploy automatically on each push

### Testing the API

Use Postman or create a simple collection:

1. **Import Postman Collection**: (You can create one using the API endpoints above)
2. **Set Environment Variables**: base_url, token
3. **Test Each Endpoint**

## 🧪 Sample Test Data

### Create Test Admin User
```bash
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@ucab.com",
  "phone": "9999999999",
  "password": "admin123",
  "role": "admin"
}
```

### Create Test Driver
```bash
POST /api/auth/register
{
  "name": "Driver John",
  "email": "driver@ucab.com",
  "phone": "8888888888",
  "password": "driver123",
  "role": "driver",
  "licenseNumber": "DL1234567890",
  "vehicleType": "sedan",
  "vehicleNumber": "KA01AB1234",
  "vehicleModel": "Toyota Camry",
  "vehicleColor": "Black"
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- Your Name - [GitHub Profile](https://github.com/your-username)
- Team Member 2
- Team Member 3

## 🙏 Acknowledgments

- Skill Wallet Team for the project opportunity
- MongoDB for excellent documentation
- Express.js community

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Coding! 🚀**
