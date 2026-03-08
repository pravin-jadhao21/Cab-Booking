# 🚀 How to Run UCab Backend

Quick start guide for your team to run the UCab backend locally.

## ⚡ Quick Start (5 minutes)

### Method 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/ucab-backend.git
cd ucab-backend

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start the server
npm run dev
```

### Method 2: Manual Setup

```bash
# 1. Clone and install
git clone https://github.com/your-username/ucab-backend.git
cd ucab-backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env file with your MongoDB URI

# 3. Start the server
npm run dev
```

---

## 📋 Prerequisites

Make sure you have these installed:

- ✅ **Node.js** (v16+): [Download](https://nodejs.org/)
- ✅ **MongoDB**: 
  - Local: [Download](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)
- ✅ **Git**: [Download](https://git-scm.com/)

---

## 🔧 Detailed Setup Steps

### Step 1: Install Node.js

**Check if installed:**
```bash
node --version  # Should show v16 or higher
npm --version
```

**If not installed:**
- Download from [nodejs.org](https://nodejs.org/)
- Install the LTS version

### Step 2: Setup MongoDB

**Option A: Local MongoDB (Development)**

1. Install MongoDB:
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Ubuntu
   sudo apt install mongodb
   ```

2. Start MongoDB:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   ```

3. Use this in `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/ucab
   ```

**Option B: MongoDB Atlas (Cloud - Recommended for Teams)**

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free M0 tier)
3. Add database user (Database Access)
4. Whitelist IP: `0.0.0.0/0` (Network Access)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
6. Use in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ucab
   ```

### Step 3: Clone and Install

```bash
# Clone repository
git clone https://github.com/your-username/ucab-backend.git
cd ucab-backend

# Install dependencies
npm install
```

### Step 4: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Update these variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Step 5: Run the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Server will start on:** `http://localhost:5000`

---

## ✅ Verify Installation

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "UCab API is running",
  "timestamp": "..."
}
```

### Test 2: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "test123"
  }'
```

---

## 📁 Project Structure

```
ucab-backend/
├── config/           # Database configuration
├── controllers/      # Business logic
├── middleware/       # Auth & error handling
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── utils/           # Helper functions
├── .env             # Environment variables (create this)
├── .env.example     # Environment template
├── server.js        # Entry point
└── package.json     # Dependencies
```

---

## 🔑 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/ucab` |
| `JWT_SECRET` | Secret for JWT tokens | `your_random_secret_32_chars_long` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 🛠️ Common Issues & Solutions

### Issue 1: Port 5000 Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

### Issue 2: MongoDB Connection Failed
**Error:** `MongooseError: connect ECONNREFUSED`

**Solutions:**
1. **Local MongoDB not running:**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```

2. **Wrong connection string:**
   - Check `MONGO_URI` in `.env`
   - Verify username/password for Atlas

3. **IP not whitelisted (Atlas):**
   - Go to MongoDB Atlas → Network Access
   - Add IP `0.0.0.0/0` (for development)

### Issue 3: Dependencies Not Installing
**Error:** `npm ERR!...`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
```

---

## 📚 Testing the API

### Using cURL (Terminal)
See [`API_TESTING.md`](./API_TESTING.md) for complete examples

### Using Postman
1. Import `UCab_Postman_Collection.json`
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api`
3. Start testing!

### Using Browser (GET requests only)
```
http://localhost:5000/api/health
```

---

## 🎯 For Skill Wallet Submission

### What to Include

1. **Demo Link:** Your deployed backend URL
   ```
   https://ucab-backend.railway.app
   ```

2. **GitHub Link:** Your repository
   ```
   https://github.com/your-username/ucab-backend
   ```

3. **README.md:** Should include:
   - Live demo URL
   - Features list
   - Tech stack
   - Setup instructions
   - API documentation

### Running Instructions for Demo

In your README, add:

```markdown
## 🌐 Live Demo

**Backend API:** https://ucab-backend.railway.app

**Test the API:**
```bash
# Health check
curl https://ucab-backend.railway.app/api/health

# Register user
curl -X POST https://ucab-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","password":"test123"}'
```

**API Documentation:** [View API Testing Guide](./API_TESTING.md)
```

---

## 👥 Team Collaboration

### For Multiple Developers

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/ucab-backend.git
   ```

2. **Each member creates their own `.env`:**
   - Use same MongoDB Atlas cluster
   - Or each use local MongoDB

3. **Work on different branches:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Push changes:**
   ```bash
   git add .
   git commit -m "Add: your feature"
   git push origin feature/your-feature-name
   ```

---

## 📞 Need Help?

1. Check [`README.md`](./README.md) - Full documentation
2. Check [`API_TESTING.md`](./API_TESTING.md) - API examples
3. Check [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deployment guide
4. Create an issue on GitHub
5. Contact team lead

---

## 🎉 Quick Commands Reference

```bash
# Setup
npm install              # Install dependencies
cp .env.example .env    # Create environment file

# Development
npm run dev             # Start with auto-reload
npm start               # Start production mode

# Testing
curl http://localhost:5000/api/health    # Health check

# Database
mongod                  # Start MongoDB (local)
mongo                   # Connect to MongoDB shell

# Git
git status              # Check status
git add .               # Stage changes
git commit -m "msg"     # Commit
git push                # Push to GitHub
```

---

**You're all set! Start building! 🚀**
