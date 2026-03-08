#!/bin/bash

# UCab Backend - Complete API Test Script
# This script tests all major endpoints in sequence

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
BASE_URL="http://localhost:5000/api"

# Test counter
PASSED=0
FAILED=0

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🧪 UCab Backend - Complete API Test Suite         ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to print test results
print_test() {
    local test_name=$1
    local response=$2
    local expected=$3
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        echo "   Response: $response"
        ((FAILED++))
    fi
}

# Function to extract token from JSON response
extract_token() {
    echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

# Function to extract ID from JSON response
extract_id() {
    echo "$1" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4
}

echo -e "${YELLOW}Starting API Tests...${NC}"
echo ""

# ============================================
# 1. HEALTH CHECK
# ============================================
echo -e "${BLUE}[1/10] Testing Health Check...${NC}"
RESPONSE=$(curl -s "$BASE_URL/health")
print_test "Health Check" "$RESPONSE" "UCab API is running"
echo ""

# ============================================
# 2. USER REGISTRATION
# ============================================
echo -e "${BLUE}[2/10] Testing User Registration...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser'$RANDOM'@example.com",
    "phone": "98765'$RANDOM'",
    "password": "test123",
    "role": "user"
  }')
print_test "User Registration" "$RESPONSE" "User registered successfully"
USER_TOKEN=$(extract_token "$RESPONSE")
echo "   Token saved: ${USER_TOKEN:0:20}..."
echo ""

# ============================================
# 3. DRIVER REGISTRATION
# ============================================
echo -e "${BLUE}[3/10] Testing Driver Registration...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver",
    "email": "testdriver'$RANDOM'@example.com",
    "phone": "98765'$RANDOM'",
    "password": "test123",
    "role": "driver",
    "licenseNumber": "DL'$RANDOM'",
    "vehicleType": "sedan",
    "vehicleNumber": "MH12AB'$RANDOM'",
    "vehicleModel": "Toyota Camry",
    "vehicleColor": "Black"
  }')
print_test "Driver Registration" "$RESPONSE" "User registered successfully"
DRIVER_TOKEN=$(extract_token "$RESPONSE")
echo "   Token saved: ${DRIVER_TOKEN:0:20}..."
echo ""

# ============================================
# 4. USER LOGIN
# ============================================
echo -e "${BLUE}[4/10] Testing User Login...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pravin@ucab.com",
    "password": "pravin123"
  }')
print_test "User Login" "$RESPONSE" "Login successful"
if [ -z "$USER_TOKEN" ]; then
    USER_TOKEN=$(extract_token "$RESPONSE")
fi
echo ""

# ============================================
# 5. GET USER PROFILE
# ============================================
echo -e "${BLUE}[5/10] Testing Get User Profile...${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN")
print_test "Get User Profile" "$RESPONSE" '"success":true'
echo ""

# ============================================
# 6. UPDATE DRIVER LOCATION
# ============================================
echo -e "${BLUE}[6/10] Testing Update Driver Location...${NC}"
RESPONSE=$(curl -s -X PUT "$BASE_URL/drivers/location" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": 77.5946,
    "latitude": 12.9716,
    "address": "MG Road, Bangalore"
  }')
print_test "Update Driver Location" "$RESPONSE" "Location updated successfully"
echo ""

# ============================================
# 7. TOGGLE DRIVER AVAILABILITY
# ============================================
echo -e "${BLUE}[7/10] Testing Toggle Driver Availability...${NC}"
RESPONSE=$(curl -s -X PUT "$BASE_URL/drivers/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN")
print_test "Toggle Driver Availability" "$RESPONSE" '"success":true'
echo ""

# ============================================
# 8. GET FARE ESTIMATE
# ============================================
echo -e "${BLUE}[8/10] Testing Fare Estimate...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/rides/estimate" \
  -H "Authorization: Bearer $USER_TOKEN" \
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
  }')
print_test "Fare Estimate" "$RESPONSE" '"distance"'
echo ""

# ============================================
# 9. BOOK A RIDE
# ============================================
echo -e "${BLUE}[9/10] Testing Book Ride...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/rides" \
  -H "Authorization: Bearer $USER_TOKEN" \
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
  }')
print_test "Book Ride" "$RESPONSE" "Ride booked successfully"
RIDE_ID=$(extract_id "$RESPONSE")
echo "   Ride ID: $RIDE_ID"
echo ""

# ============================================
# 10. GET NEARBY DRIVERS
# ============================================
echo -e "${BLUE}[10/10] Testing Get Nearby Drivers...${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/drivers/nearby?longitude=77.5946&latitude=12.9716&vehicleType=sedan" \
  -H "Authorization: Bearer $USER_TOKEN")
print_test "Get Nearby Drivers" "$RESPONSE" '"success":true'
echo ""

# ============================================
# ADDITIONAL WORKFLOW TESTS
# ============================================
if [ ! -z "$RIDE_ID" ] && [ ! -z "$DRIVER_TOKEN" ]; then
    echo -e "${YELLOW}Bonus: Testing Complete Ride Workflow...${NC}"
    echo ""
    
    # Accept Ride
    echo -e "${BLUE}[Bonus 1] Testing Accept Ride...${NC}"
    RESPONSE=$(curl -s -X PUT "$BASE_URL/rides/$RIDE_ID/accept" \
      -H "Authorization: Bearer $DRIVER_TOKEN")
    print_test "Accept Ride" "$RESPONSE" "Ride accepted successfully"
    echo ""
    
    # Get Ride Details
    echo -e "${BLUE}[Bonus 2] Testing Get Ride Details...${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/rides/$RIDE_ID" \
      -H "Authorization: Bearer $USER_TOKEN")
    print_test "Get Ride Details" "$RESPONSE" '"success":true'
    
    # Extract OTP
    OTP=$(echo "$RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)
    echo "   OTP: $OTP"
    echo ""
    
    # Start Ride
    if [ ! -z "$OTP" ]; then
        echo -e "${BLUE}[Bonus 3] Testing Start Ride with OTP...${NC}"
        RESPONSE=$(curl -s -X PUT "$BASE_URL/rides/$RIDE_ID/start" \
          -H "Authorization: Bearer $DRIVER_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "otp": "'$OTP'"
          }')
        print_test "Start Ride" "$RESPONSE" "Ride started successfully"
        echo ""
        
        # Complete Ride
        echo -e "${BLUE}[Bonus 4] Testing Complete Ride...${NC}"
        RESPONSE=$(curl -s -X PUT "$BASE_URL/rides/$RIDE_ID/complete" \
          -H "Authorization: Bearer $DRIVER_TOKEN")
        print_test "Complete Ride" "$RESPONSE" "Ride completed successfully"
        echo ""
        
        # Process Payment
        echo -e "${BLUE}[Bonus 5] Testing Process Payment...${NC}"
        RESPONSE=$(curl -s -X POST "$BASE_URL/payments" \
          -H "Authorization: Bearer $USER_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "rideId": "'$RIDE_ID'",
            "paymentMethod": "cash"
          }')
        print_test "Process Payment" "$RESPONSE" "Payment processed successfully"
        PAYMENT_ID=$(extract_id "$RESPONSE")
        echo ""
        
        # Rate Ride
        echo -e "${BLUE}[Bonus 6] Testing Rate Ride...${NC}"
        RESPONSE=$(curl -s -X PUT "$BASE_URL/rides/$RIDE_ID/rate" \
          -H "Authorization: Bearer $USER_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "rating": 5,
            "comment": "Excellent service from automated test!"
          }')
        print_test "Rate Ride" "$RESPONSE" "Rating submitted successfully"
        echo ""
        
        # Get Receipt
        if [ ! -z "$PAYMENT_ID" ]; then
            echo -e "${BLUE}[Bonus 7] Testing Get Payment Receipt...${NC}"
            RESPONSE=$(curl -s -X GET "$BASE_URL/payments/$PAYMENT_ID/receipt" \
              -H "Authorization: Bearer $USER_TOKEN")
            print_test "Get Receipt" "$RESPONSE" '"receiptNumber"'
            echo ""
        fi
    fi
fi

# ============================================
# TEST SUMMARY
# ============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    TEST SUMMARY                       ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests Run: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║   ✅ ALL TESTS PASSED! Your API is working great!    ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║   ⚠️  Some tests failed. Check the output above.     ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
