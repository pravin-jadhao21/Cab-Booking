# 🚖 UCab – Real-Time Cab Booking System

A full-stack MERN cab booking platform that enables passengers to book rides and drivers to accept them in real time.

The system includes secure authentication, ride lifecycle management, OTP-based ride verification, live ride status updates using Socket.IO, automatic ride expiration, driver management, and responsive dashboards for both passengers and drivers.

---

# 🌐 Live Demo

### Frontend (Vercel)

https://cab-booking-bay.vercel.app

### Backend API (Render)

https://cab-booking-rxra.onrender.com

---

# ✨ Features

## 👤 Passenger Features

- User Registration & Login
- JWT Authentication
- Book a Ride
- Fare Estimation
- View Active Ride Status
- Ride History
- Cancel Ride Request
- OTP-Based Ride Verification
- Rate Completed Rides
- Real-Time Ride Updates

---

## 🚗 Driver Features

- Driver Registration & Login
- Driver Verification System
- Go Online / Offline
- View Available Ride Requests
- Accept Ride Requests
- Start Ride using OTP Verification
- Complete Ride
- Driver Earnings Dashboard
- Driver Ratings
- Real-Time Ride Notifications

---

## ⚡ Real-Time Features

- Socket.IO Integration
- Live Ride Status Updates
- Instant Ride Acceptance Notifications
- Ride Started / Completed Notifications
- Driver Availability Updates
- Real-Time Event Broadcasting

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization
- OTP Verification Before Ride Start

---

## 🧠 Smart System Features

### Real-Time Ride Updates

Implemented using Socket.IO to provide instant updates for:

- Ride Created
- Ride Accepted
- Ride Started
- Ride Completed
- Ride Cancelled

Without requiring page refreshes.


### Ride Request Expiry

If no driver accepts a ride within 10 minutes:

- Ride automatically expires
- Drivers can no longer accept it
- User sees "Ride Expired" status

### OTP Expiry

- OTP generated during ride booking
- Valid for limited time
- Prevents unauthorized ride starts

### Race Condition Handling

Only one driver can successfully accept a ride.

Implemented using atomic MongoDB updates:

```js
findOneAndUpdate()
```

This prevents multiple drivers from accepting the same ride simultaneously.

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Axios
- React Router
- Socket.IO Client
- CSS3

## Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- bcryptjs
- Node Cron

## Database

- MongoDB Atlas
- Mongoose ODM

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📂 Project Structure

```text
Cab-Booking
│
├── backend
│   ├── config
│   ├── controllers
│   ├── cronJobs
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── project-architecture
│
├── README.md
├── fix-remove-distance.sh
├── setup-complete-frontend.sh
└── .gitignore
```
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/pravin-jadhao21/Cab-Booking.git

cd Cab-Booking
```

---

# 2️⃣ Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_uri

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

# 3️⃣ Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

# 🔐 Authentication Flow

1. User logs in
2. JWT token generated
3. Token stored on client
4. Token attached to protected requests
5. Middleware verifies token before access

---

# 🚖 Ride Booking Workflow

### Passenger

1. Login/Register
2. Select pickup & destination
3. Get fare estimate
4. Book ride
5. Receive OTP
6. Track ride status
7. Complete ride
8. Submit rating

### Driver

1. Login/Register
2. Go online
3. View available rides
4. Accept ride
5. Verify OTP
6. Start ride
7. Complete ride
8. Receive earnings update

---

# 🔄 Ride Status Lifecycle

```text
Pending
   │
   ├── Accepted
   │       │
   │       └── Started
   │               │
   │               └── Completed
   │
   ├── Cancelled
   │
   └── Expired
```

---

# 🗄 Database Collections

## Users

```text
- name
- email
- password
- role
- phone
```

## Drivers

```text
- user
- vehicleType
- vehicleNumber
- vehicleModel
- rating
- earnings
- isAvailable
- isVerified
```

## Rides

```text
- user
- driver
- pickupLocation
- dropLocation
- distance
- duration
- fare
- status
- otp
- otpExpiresAt
- rideRequestExpiresAt
- rating
```

---

# 📸 Screenshots

<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/f5da6ddc-4dcb-4b4d-997c-75d6935746c4" />

<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/94be2022-f013-4bcf-ab20-32a1c4bc793a" />

<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/42a499ff-8589-4adc-b64c-5a30d3860357" />


<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/9c42d1bc-2687-44e8-badb-a3487e021b27" />

<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/7f6297ac-27cd-4930-b6f5-ea47784dfe0a" />

<img width="1840" height="1079" alt="image" src="https://github.com/user-attachments/assets/478469a0-739b-40a1-a482-700c2b6703be" />



---

# 🚀 Future Improvements

- Live Driver Location Tracking
- Interactive Maps Integration (Leaflet/Google Maps)
- Route Navigation
- Payment Gateway Integration
- Push Notifications
- Ride Scheduling
- Surge Pricing
- Admin Analytics Dashboard
- Mobile App Version

---

# 📈 Key Learning Outcomes

This project demonstrates:

- MERN Stack Development
- REST API Design
- MongoDB Data Modeling
- JWT Authentication
- Socket.IO Real-Time Communication
- Race Condition Handling
- Cron Jobs & Background Tasks
- Deployment on Render & Vercel
- Production-Level Backend Architecture

---


# 📄 License

Licensed under the MIT License.

---

⭐ If you found this project useful, please consider giving it a Star on GitHub.
