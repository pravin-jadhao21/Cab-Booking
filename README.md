# 🚖 UCab – Cab Booking System

A full-stack cab booking web application where passengers can request rides and drivers can accept them in real time.
This project demonstrates a complete ride-booking workflow including authentication, ride creation, driver acceptance, and ride status updates.

---

# 🌐 Live Demo

Frontend (Deployed on Vercel)
https://cab-booking-ctfmd3no1-pravin-jadhao21s-projects.vercel.app

Backend API (Deployed on Railway)
https://cab-booking-production-4a5b.up.railway.app

---

# 📌 Features

## Passenger Features

* User registration and login
* Create ride requests
* View ride status
* Track accepted rides

## Driver Features

* Driver login
* View available ride requests
* Accept ride requests
* Update ride status

## System Features

* Secure authentication using JWT
* Role-based access (Passenger / Driver)
* RESTful API architecture
* MongoDB database integration
* Full stack deployment

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Axios
* CSS / Tailwind (if used)

## Backend

* Node.js
* Express.js
* JWT Authentication
* REST API

## Database

* MongoDB Atlas

## Deployment

* Vercel – Frontend hosting
* Railway – Backend hosting

---

## 📂 Project Structure

```
Cab-Booking
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```


---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

git clone https://github.com/pravin-jadhao21/Cab-Booking.git

cd Cab-Booking

---

# 2️⃣ Backend Setup

cd backend

Install dependencies

npm install

Create .env file

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Run backend

npm run dev

---

# 3️⃣ Frontend Setup

cd frontend

Install dependencies

npm install

Create .env file

VITE_API_URL=http://localhost:5000/api

Run frontend

npm run dev

---

# 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication.

After login:

* A token is generated
* Stored on the client
* Sent with every protected API request

---

# 🚗 Ride Booking Workflow

1. Passenger registers/logs in
2. Passenger creates ride request
3. Ride request stored in database
4. Driver logs in
5. Driver views available ride requests
6. Driver accepts ride
7. Ride status updates to **Accepted**

---

# 🗄 Database

MongoDB Atlas stores:

Users

* id
* name
* email
* password
* role (driver/passenger)

Rides

* id
* passengerId
* driverId
* pickupLocation
* destination
* status

---

# 📸 Screenshots

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/4e2fbd08-4990-48f5-9ca8-77dc67cf7b87" />

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/55bea86b-7bb0-48ee-b3ef-d392e092d88d" />

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/33c6161f-be09-4209-ab7e-9e9a2dc3fb7e" />

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/8ebac077-304c-40b8-ba4c-e030cc65f1ff" />

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/de5dd40c-c568-4c28-a38c-124bc7e6a31b" />

<img width="1849" height="1077" alt="image" src="https://github.com/user-attachments/assets/b6be6063-3d14-49c0-b968-f713b6f4d9d2" />

<img width="1849" height="1089" alt="image" src="https://github.com/user-attachments/assets/dba9cc07-9880-4f18-adc4-e84b4fc854ec" />

<img width="1859" height="1087" alt="image" src="https://github.com/user-attachments/assets/38a5e638-d95d-42f1-a153-3281537821d6" />



---

# 🚀 Future Improvements

* Real-time ride updates using Socket.io
* Live driver tracking with maps
* Payment gateway integration
* Ride history
* Rating system
* Mobile responsive UI improvements

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a pull request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Authors

Pravin Jadhao
GitHub: https://github.com/pravin-jadhao21

Ruchi Jadhav
GitHub: https://github.com/ruchijadhav68-prog

Raghav Deshpande 
GitHub: https://github.com/ItsRaghav2006

---

⭐ If you like this project, consider giving it a star on GitHub!
