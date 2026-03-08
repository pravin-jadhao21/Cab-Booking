#!/bin/bash

# UCab Backend Setup Script
# This script helps you quickly set up the UCab backend

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🚗  UCab Backend Setup                             ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    echo "Download from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION is installed"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION is installed"
fi

# Check if MongoDB is running (optional)
echo ""
echo "Checking MongoDB..."
if command -v mongod &> /dev/null; then
    print_success "MongoDB is installed"
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB is running"
    else
        print_info "MongoDB is installed but not running"
        echo "Start MongoDB with: sudo systemctl start mongod (Linux) or brew services start mongodb-community (macOS)"
    fi
else
    print_info "MongoDB not found locally. You can use MongoDB Atlas instead."
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Setup environment file
echo ""
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_info "Please edit .env file with your configuration"
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env with generated JWT secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your_super_secret_jwt_key_change_this_in_production/$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/your_super_secret_jwt_key_change_this_in_production/$JWT_SECRET/" .env
    fi
    
    print_success "Generated JWT secret and updated .env file"
else
    print_info ".env file already exists"
fi

# Ask user for MongoDB setup
echo ""
echo "MongoDB Setup:"
echo "1. Use local MongoDB (mongodb://localhost:27017/ucab)"
echo "2. Use MongoDB Atlas (cloud)"
read -p "Choose option (1 or 2): " mongo_option

if [ "$mongo_option" == "1" ]; then
    # Use local MongoDB
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|MONGO_URI=.*|MONGO_URI=mongodb://localhost:27017/ucab|" .env
    else
        sed -i "s|MONGO_URI=.*|MONGO_URI=mongodb://localhost:27017/ucab|" .env
    fi
    print_success "Configured to use local MongoDB"
elif [ "$mongo_option" == "2" ]; then
    echo ""
    print_info "Please create a MongoDB Atlas account at: https://www.mongodb.com/cloud/atlas"
    print_info "Then update the MONGO_URI in .env file with your connection string"
fi

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ✅  Setup Complete!                                ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit .env file if needed (especially MONGO_URI for Atlas)"
echo "2. Start the server:"
echo "   - Development: npm run dev"
echo "   - Production: npm start"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "4. View API documentation: cat API_TESTING.md"
echo ""
print_info "For deployment instructions, see DEPLOYMENT.md"
echo ""
