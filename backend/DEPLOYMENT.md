# 🚀 UCab Backend Deployment Guide

Complete guide for deploying UCab backend to various platforms.

## 📋 Table of Contents
1. [Railway Deployment](#railway-deployment)
2. [Render Deployment](#render-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [AWS EC2 Deployment](#aws-ec2-deployment)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Database Setup](#database-setup)
7. [Post-Deployment Testing](#post-deployment-testing)

---

## 1. Railway Deployment (Recommended - Easiest)

### Prerequisites
- GitHub account
- Railway account (free tier available)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/ucab-backend.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MongoDB Database**
   - In Railway project, click "+ New"
   - Select "Database" → "MongoDB"
   - Railway will auto-create the database

4. **Configure Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add all variables from `.env.example`
   - For `MONGO_URI`, use the connection string from Railway MongoDB service

5. **Deploy**
   - Railway automatically deploys on push
   - Check deployment logs
   - Get your public URL (e.g., `https://ucab-backend-production.up.railway.app`)

### Railway Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGO_URI=${{MongoDB.MONGO_URL}}  # Auto-filled by Railway
JWT_SECRET=your_production_secret_here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.com
```

---

## 2. Render Deployment

### Prerequisites
- GitHub account
- Render account

### Steps

1. **Push to GitHub** (same as Railway)

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - Name: `ucab-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add MongoDB**
   - Option A: Use MongoDB Atlas (Recommended)
   - Option B: Use Render's PostgreSQL (requires code changes)

4. **Set Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add all variables

5. **Deploy**
   - Click "Create Web Service"
   - Monitor build logs

### Render Configuration File (render.yaml)
```yaml
services:
  - type: web
    name: ucab-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
```

---

## 3. Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account

### Steps

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Ubuntu
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create ucab-backend
   ```

4. **Add MongoDB**
   ```bash
   # Option 1: MongoDB Atlas (Recommended)
   # Set MONGO_URI manually
   
   # Option 2: mLab addon (if available)
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_here
   heroku config:set JWT_EXPIRE=7d
   heroku config:set CLIENT_URL=https://your-frontend.com
   heroku config:set MONGO_URI=your_mongodb_uri
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   heroku logs --tail  # View logs
   ```

### Procfile
Create a `Procfile` in root:
```
web: npm start
```

---

## 4. AWS EC2 Deployment

### Prerequisites
- AWS account
- Basic Linux knowledge

### Steps

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier)
   - Security Group: Allow ports 22, 80, 443, 5000

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js and MongoDB**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

4. **Clone and Setup Application**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/your-username/ucab-backend.git
   cd ucab-backend
   npm install
   ```

5. **Configure Environment**
   ```bash
   nano .env
   # Add your environment variables
   ```

6. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name ucab-backend
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx (Optional)**
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/ucab
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/ucab /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt (Optional)**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 5. Environment Variables Setup

### Production Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ucab?retryWrites=true&w=majority

# JWT (Generate strong secret)
JWT_SECRET=use_a_very_strong_random_string_here_minimum_32_characters
JWT_EXPIRE=7d

# CORS
CLIENT_URL=https://your-frontend-domain.com
```

### Generate Strong JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6. Database Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free account

2. **Create Cluster**
   - Select free tier (M0)
   - Choose region closest to your server
   - Create cluster

3. **Configure Database Access**
   - Database Access → Add New Database User
   - Create username and password
   - Grant "Read and Write" privileges

4. **Configure Network Access**
   - Network Access → Add IP Address
   - For development: Add `0.0.0.0/0` (allow from anywhere)
   - For production: Add your server's IP

5. **Get Connection String**
   - Clusters → Connect → Connect Your Application
   - Copy connection string
   - Replace `<password>` with your password

### Option B: Local MongoDB (Development)

```bash
# Install MongoDB locally
# Use connection string:
MONGO_URI=mongodb://localhost:27017/ucab
```

---

## 7. Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-deployed-url.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "UCab API is running",
  "timestamp": "2024-..."
}
```

### 2. Test User Registration
```bash
curl -X POST https://your-deployed-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "test123"
  }'
```

### 3. Monitor Logs

**Railway:**
```bash
# In Railway dashboard → View Logs
```

**Render:**
```bash
# In Render dashboard → Logs tab
```

**Heroku:**
```bash
heroku logs --tail
```

**AWS EC2:**
```bash
pm2 logs ucab-backend
```

---

## 📊 Demo Link & GitHub Setup

### For Skill Wallet Submission

1. **Demo Link**
   ```
   https://ucab-backend.up.railway.app
   ```

2. **GitHub Link**
   ```
   https://github.com/your-username/ucab-backend
   ```

3. **README.md should include**
   - Live demo URL
   - API documentation link
   - Setup instructions
   - Technology stack
   - Features list

### Update README with Demo Link

Add this section to your README.md:

```markdown
## 🌐 Live Demo

- **Backend API**: https://ucab-backend.up.railway.app
- **API Health Check**: https://ucab-backend.up.railway.app/api/health
- **API Documentation**: [View Testing Guide](./API_TESTING.md)

### Test Credentials

**User Account**
- Email: demo@ucab.com
- Password: demo123

**Driver Account**
- Email: driver@ucab.com
- Password: demo123
```

---

## 🔒 Security Checklist

- [ ] Strong JWT secret in production
- [ ] MongoDB authentication enabled
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Environment variables not in code
- [ ] `.env` file in `.gitignore`
- [ ] Rate limiting implemented (optional)
- [ ] Input validation on all endpoints

---

## 🐛 Common Deployment Issues

### Issue 1: MongoDB Connection Failed
**Solution**: Check MongoDB connection string, whitelist IP in Atlas

### Issue 2: App Crashes on Start
**Solution**: Check logs, ensure all environment variables are set

### Issue 3: CORS Errors
**Solution**: Update `CLIENT_URL` environment variable

### Issue 4: Port Already in Use
**Solution**: Use different port or kill existing process

---

## 📞 Support

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test locally first
4. Check MongoDB connection
5. Review security group/firewall settings

---

**Deployment Complete! 🎉**
