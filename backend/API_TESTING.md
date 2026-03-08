# 🧪 UCab API Testing Guide

Complete guide for testing all API endpoints using cURL, Postman, or any HTTP client.

## 🔧 Setup

### Base URL
```
http://localhost:5000/api
```

### Headers
All authenticated requests require:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 1️⃣ Authentication Flow

### 1.1 Register as User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice User",
    "email": "alice@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "name": "Alice User",
    "email": "alice@example.com",
    "phone": "9876543210",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Register as Driver
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Driver",
    "email": "bob@example.com",
    "phone": "9876543211",
    "password": "password123",
    "role": "driver",
    "licenseNumber": "DL1234567890",
    "vehicleType": "sedan",
    "vehicleNumber": "KA01AB1234",
    "vehicleModel": "Toyota Camry",
    "vehicleColor": "Black"
  }'
```

### 1.3 Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Save the token from response for subsequent requests!**

### 1.4 Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2️⃣ Driver Operations

### 2.1 Update Driver Location (Driver only)
```bash
curl -X PUT http://localhost:5000/api/drivers/location \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": 77.5946,
    "latitude": 12.9716,
    "address": "MG Road, Bangalore"
  }'
```

### 2.2 Toggle Driver Availability (Driver only)
```bash
curl -X PUT http://localhost:5000/api/drivers/availability \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 2.3 Get Nearby Drivers (Any authenticated user)
```bash
curl -X GET "http://localhost:5000/api/drivers/nearby?longitude=77.5946&latitude=12.9716&vehicleType=sedan&maxDistance=5000" \
  -H "Authorization: Bearer USER_TOKEN"
```

### 2.4 Get Driver Profile (Driver only)
```bash
curl -X GET http://localhost:5000/api/drivers/profile \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 2.5 Update Driver Profile (Driver only)
```bash
curl -X PUT http://localhost:5000/api/drivers/profile \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "suv",
    "vehicleNumber": "KA01AB5678",
    "vehicleModel": "Ford Endeavour",
    "vehicleColor": "White",
    "bankDetails": {
      "accountNumber": "123456789012",
      "ifscCode": "SBIN0001234",
      "accountHolderName": "Bob Driver"
    }
  }'
```

---

## 3️⃣ Ride Booking Flow

### 3.1 Get Fare Estimate
```bash
curl -X POST http://localhost:5000/api/rides/estimate \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {
      "coordinates": [77.5946, 12.9716],
      "address": "MG Road, Bangalore"
    },
    "dropLocation": {
      "coordinates": [77.6408, 12.9279],
      "address": "Whitefield, Bangalore"
    },
    "vehicleType": "sedan"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "distance": 8.45,
    "duration": 13,
    "fare": {
      "baseFare": 80,
      "distanceFare": 127,
      "timeFare": 20,
      "tax": 11,
      "total": 238
    }
  }
}
```

### 3.2 Book a Ride (User only)
```bash
curl -X POST http://localhost:5000/api/rides \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Save the ride ID and OTP from response!**

### 3.3 Accept Ride (Driver only)
```bash
curl -X PUT http://localhost:5000/api/rides/RIDE_ID/accept \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 3.4 Start Ride (Driver only)
```bash
curl -X PUT http://localhost:5000/api/rides/RIDE_ID/start \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "1234"
  }'
```

### 3.5 Complete Ride (Driver only)
```bash
curl -X PUT http://localhost:5000/api/rides/RIDE_ID/complete \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 3.6 Cancel Ride
```bash
curl -X PUT http://localhost:5000/api/rides/RIDE_ID/cancel \
  -H "Authorization: Bearer USER_OR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Emergency came up"
  }'
```

### 3.7 Rate Ride (User only)
```bash
curl -X PUT http://localhost:5000/api/rides/RIDE_ID/rate \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Great driver! Smooth ride."
  }'
```

### 3.8 Get My Rides (User only)
```bash
# All rides
curl -X GET http://localhost:5000/api/rides/my-rides \
  -H "Authorization: Bearer USER_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/rides/my-rides?status=completed" \
  -H "Authorization: Bearer USER_TOKEN"
```

### 3.9 Get Driver Rides (Driver only)
```bash
curl -X GET http://localhost:5000/api/rides/driver-rides \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### 3.10 Get Ride Details
```bash
curl -X GET http://localhost:5000/api/rides/RIDE_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## 4️⃣ Payment Operations

### 4.1 Process Payment (User only)
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "RIDE_ID",
    "paymentMethod": "card",
    "cardDetails": {
      "last4Digits": "1234",
      "cardType": "visa"
    }
  }'
```

### 4.2 Get Payment Details
```bash
curl -X GET http://localhost:5000/api/payments/PAYMENT_ID \
  -H "Authorization: Bearer TOKEN"
```

### 4.3 Get Payment by Ride
```bash
curl -X GET http://localhost:5000/api/payments/ride/RIDE_ID \
  -H "Authorization: Bearer TOKEN"
```

### 4.4 Get Payment Receipt
```bash
curl -X GET http://localhost:5000/api/payments/PAYMENT_ID/receipt \
  -H "Authorization: Bearer TOKEN"
```

### 4.5 Get User Payment History (User only)
```bash
curl -X GET http://localhost:5000/api/payments/my-payments \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## 5️⃣ Complete Workflow Example

### Step-by-Step Ride Booking

1. **User Registration**
   - Register user → Get token

2. **Driver Registration & Setup**
   - Register driver → Get token
   - Update driver location
   - Toggle availability to true

3. **Fare Estimation**
   - User gets fare estimate for their route

4. **Book Ride**
   - User books ride → Receives ride ID and OTP

5. **Accept Ride**
   - Driver accepts the ride

6. **Start Ride**
   - Driver enters OTP and starts ride

7. **Complete Ride**
   - Driver completes the ride

8. **Payment**
   - User processes payment

9. **Rating**
   - User rates the ride

10. **Receipt**
    - User downloads receipt

---

## 🎯 Common Use Cases

### Find Available Drivers Near Location
```bash
curl -X GET "http://localhost:5000/api/drivers/nearby?longitude=77.5946&latitude=12.9716" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Check Driver Earnings (Driver)
```bash
curl -X GET http://localhost:5000/api/drivers/earnings \
  -H "Authorization: Bearer DRIVER_TOKEN"
```

### View Ride History (User)
```bash
curl -X GET http://localhost:5000/api/rides/my-rides \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## 🐛 Troubleshooting

### Common Errors

**401 Unauthorized**
- Token missing or invalid
- Solution: Re-login and get new token

**403 Forbidden**
- Wrong role trying to access endpoint
- Solution: Use correct user role (user/driver/admin)

**404 Not Found**
- Resource doesn't exist or wrong ID
- Solution: Verify IDs and endpoints

**400 Bad Request**
- Missing required fields or validation error
- Solution: Check request body matches schema

---

## 📝 Notes

1. **Coordinates Format**: Always use `[longitude, latitude]` order
2. **Token Expiry**: Tokens expire after 7 days (configurable)
3. **Distance**: Returned in kilometers
4. **Duration**: Returned in minutes
5. **Fare**: All amounts in local currency units

---

## 🚀 Postman Collection

You can import these endpoints into Postman:

1. Create new collection "UCab API"
2. Add environment variable:
   - `baseUrl`: `http://localhost:5000/api`
   - `userToken`: `<your_user_token>`
   - `driverToken`: `<your_driver_token>`
3. Import all endpoints above
4. Use `{{baseUrl}}` and `{{userToken}}` variables

---

Happy Testing! 🎉
