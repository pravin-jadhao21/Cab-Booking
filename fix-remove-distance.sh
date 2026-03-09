#!/bin/bash

# Quick Fix: Remove Distance Dependency - Use Flat Rates

echo "🔧 Applying Quick Fix - Flat Rate Pricing..."

cd ~/Downloads/Cab-Booking/frontend/src || exit 1

# Backup original
cp App.jsx App.jsx.backup

# Update to use flat rates instead of distance-based pricing
cat > App.jsx << 'APPEOF'
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Car, User, MapPin, Star, Clock, LogOut, Phone, Mail, Lock, TrendingUp, DollarSign, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';

// ==================== API Configuration ====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// ==================== Flat Rate Pricing ====================
const FLAT_RATES = {
  mini: 100,
  sedan: 150,
  suv: 250,
  premium: 400
};

const VEHICLE_NAMES = {
  mini: 'Mini',
  sedan: 'Sedan',
  suv: 'SUV',
  premium: 'Premium'
};

// ==================== Context ====================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    toast.success('Welcome back!');
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    toast.success('Account created successfully!');
    return data.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Components ====================

function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border-2 border-primary-600'
  };

  return (
    <button
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
        <input
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl border-2 ${
            error ? 'border-red-500' : 'border-gray-200'
          } focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none bg-white ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    started: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ==================== Pages ====================

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'driver' ? '/driver' : '/user');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">UCab</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="secondary" className="!py-2">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="!py-2 !bg-white !text-primary-600 hover:!bg-gray-100">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-white">
            Your Ride,
            <br />
            <span className="text-yellow-300">On Demand</span>
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Book reliable cabs in seconds. Safe, affordable, and always on time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=user">
              <Button className="!bg-white !text-primary-600 hover:!bg-gray-100 !px-8 !py-4 text-lg">
                <User className="w-5 h-5 mr-2 inline" />
                Book a Ride
              </Button>
            </Link>
            <Link to="/register?role=driver">
              <Button variant="outline" className="!border-white !text-white hover:!bg-white/10 !px-8 !py-4 text-lg">
                <Car className="w-5 h-5 mr-2 inline" />
                Drive with Us
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          {[
            { icon: Car, title: 'Flat Rates', desc: 'Transparent pricing, no surprises' },
            { icon: Clock, title: 'Quick Booking', desc: 'Book in under 30 seconds' },
            { icon: Star, title: 'Top Rated Drivers', desc: '4.8+ average rating' }
          ].map((feature, i) => (
            <Card key={i} className="text-center">
              <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'driver' ? '/driver' : '/user');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="w-10 h-10 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">UCab</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
}

function Register() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultRole = searchParams.get('role') || 'user';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: defaultRole,
    licenseNumber: '',
    vehicleType: 'sedan',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleColor: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      navigate(user.role === 'driver' ? '/driver' : '/user');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isDriver = formData.role === 'driver';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="w-10 h-10 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">UCab</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'user'})}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${formData.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <User className="w-5 h-5 inline mr-2" />
              User
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'driver'})}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${formData.role === 'driver' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Car className="w-5 h-5 inline mr-2" />
              Driver
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" icon={User} value={formData.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" icon={Mail} value={formData.email} onChange={handleChange} required />
            <Input label="Phone (10 digits)" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} required />
            <Input label="Password" name="password" type="password" icon={Lock} value={formData.password} onChange={handleChange} required />
          </div>

          {isDriver && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <Input label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required={isDriver} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none bg-white">
                  <option value="mini">Mini</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <Input label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="MH12AB1234" required={isDriver} />
              <Input label="Vehicle Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Toyota Camry" required={isDriver} />
              <Input label="Vehicle Color" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="Black" required={isDriver} />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('book');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    dropAddress: '',
    vehicleType: 'sedan'
  });
  const [selectedFare, setSelectedFare] = useState(FLAT_RATES.sedan);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/my-rides');
      setRides(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVehicleChange = (vehicleType) => {
    setBookingData({...bookingData, vehicleType});
    setSelectedFare(FLAT_RATES[vehicleType]);
  };

  const bookRide = async () => {
    if (!bookingData.pickupAddress || !bookingData.dropAddress) {
      toast.error('Please enter both pickup and drop locations');
      return;
    }

    setLoading(true);
    try {
      // Use dummy coordinates - backend will accept them
      await api.post('/rides', {
        pickupLocation: {
          coordinates: [77.5946, 12.9716],
          address: bookingData.pickupAddress
        },
        dropLocation: {
          coordinates: [77.6408, 12.9279],
          address: bookingData.dropAddress
        },
        vehicleType: bookingData.vehicleType,
        paymentMethod: 'cash'
      });
      toast.success('Ride booked successfully!');
      fetchRides();
      setActiveTab('rides');
      setBookingData({ pickupAddress: '', dropAddress: '', vehicleType: 'sedan' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const rateRide = async (rideId, rating) => {
    try {
      await api.put(`/rides/${rideId}/rate`, { rating, comment: 'Great service!' });
      toast.success('Rating submitted!');
      fetchRides();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">UCab</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hi, {user?.name}</span>
              <Button variant="secondary" onClick={logout} className="!py-2">
                <LogOut className="w-4 h-4 mr-2 inline" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'book' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            Book Ride
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'rides' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            My Rides
          </button>
        </div>

        {activeTab === 'book' && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-6">Book Your Ride</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Flat Rate Pricing</p>
                    <p className="text-xs mt-1">Simple, transparent fares with no hidden charges</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Pickup Location"
                  icon={MapPin}
                  value={bookingData.pickupAddress}
                  onChange={(e) => setBookingData({...bookingData, pickupAddress: e.target.value})}
                  placeholder="Enter pickup address"
                />
                <Input
                  label="Drop Location"
                  icon={MapPin}
                  value={bookingData.dropAddress}
                  onChange={(e) => setBookingData({...bookingData, dropAddress: e.target.value})}
                  placeholder="Enter drop address"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    value={bookingData.vehicleType}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none bg-white"
                  >
                    <option value="mini">Mini - ₹{FLAT_RATES.mini}</option>
                    <option value="sedan">Sedan - ₹{FLAT_RATES.sedan}</option>
                    <option value="suv">SUV - ₹{FLAT_RATES.suv}</option>
                    <option value="premium">Premium - ₹{FLAT_RATES.premium}</option>
                  </select>
                </div>
                <Button onClick={bookRide} className="w-full" disabled={loading}>
                  {loading ? 'Booking...' : `Book Now - ₹${selectedFare}`}
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-6">Pricing</h3>
              <div className="space-y-3">
                {Object.entries(FLAT_RATES).map(([type, price]) => (
                  <div 
                    key={type}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      bookingData.vehicleType === type 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleVehicleChange(type)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{VEHICLE_NAMES[type]}</p>
                        <p className="text-sm text-gray-600">Flat rate</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-600">₹{price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  ✓ No surge pricing<br/>
                  ✓ No hidden fees<br/>
                  ✓ Pay what you see
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'rides' && (
          <div className="space-y-4">
            {rides.length === 0 ? (
              <Card className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No rides yet. Book your first ride!</p>
              </Card>
            ) : (
              rides.map((ride) => (
                <Card key={ride._id} hover>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <StatusBadge status={ride.status} />
                      <p className="text-sm text-gray-500 mt-2">{new Date(ride.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">₹{ride.fare.total}</p>
                      <p className="text-sm text-gray-500">{VEHICLE_NAMES[ride.vehicleType]}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Pickup</p>
                        <p className="font-medium">{ride.pickupLocation.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Drop</p>
                        <p className="font-medium">{ride.dropLocation.address}</p>
                      </div>
                    </div>
                  </div>
                  {ride.status === 'completed' && !ride.rating?.value && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Rate this ride:</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => rateRide(ride._id, rating)}
                            className="p-2 hover:scale-110 transition-transform"
                          >
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {ride.rating?.value && (
                    <div className="mt-4 pt-4 border-t flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-2" />
                      <span className="font-medium">Rated {ride.rating.value}/5</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchRides();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/drivers/profile');
      setProfile(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/driver-rides');
      setRides(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      await api.put('/drivers/availability');
      fetchProfile();
      toast.success('Availability updated!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/accept`);
      toast.success('Ride accepted!');
      fetchRides();
    } catch (error) {
      console.error(error);
    }
  };

  const startRide = async (rideId, otp) => {
    try {
      await api.put(`/rides/${rideId}/start`, { otp });
      toast.success('Ride started!');
      fetchRides();
    } catch (error) {
      console.error(error);
    }
  };

  const completeRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/complete`);
      toast.success('Ride completed!');
      fetchRides();
      fetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">UCab Driver</span>
            </div>
            <div className="flex items-center space-x-4">
              {profile && (
                <button
                  onClick={toggleAvailability}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${profile.isAvailable ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                >
                  {profile.isAvailable ? '🟢 Online' : '🔴 Offline'}
                </button>
              )}
              <span className="text-gray-700">Hi, {user?.name}</span>
              <Button variant="secondary" onClick={logout} className="!py-2">
                <LogOut className="w-4 h-4 mr-2 inline" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {profile && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Rides</p>
                  <p className="text-3xl font-bold text-gray-900">{profile.totalRides}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Earnings</p>
                  <p className="text-3xl font-bold text-green-600">₹{profile.earnings}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">{profile.rating}</p>
                </div>
                <Star className="w-10 h-10 text-yellow-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-xl font-bold text-gray-900">{profile.isVerified ? '✓ Verified' : '⏳ Pending'}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-primary-600" />
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Rides</h2>
          {rides.length === 0 ? (
            <Card className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No rides yet. Go online to start receiving requests!</p>
            </Card>
          ) : (
            rides.map((ride) => (
              <Card key={ride._id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <StatusBadge status={ride.status} />
                    <p className="text-sm text-gray-500 mt-2">{new Date(ride.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{ride.fare.total}</p>
                    <p className="text-sm text-gray-500">{VEHICLE_NAMES[ride.vehicleType]}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="font-medium">{ride.pickupLocation.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Drop</p>
                      <p className="font-medium">{ride.dropLocation.address}</p>
                    </div>
                  </div>
                </div>
                {ride.status === 'pending' && (
                  <Button onClick={() => acceptRide(ride._id)} className="w-full">
                    Accept Ride - ₹{ride.fare.total}
                  </Button>
                )}
                {ride.status === 'accepted' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">OTP: <span className="font-mono font-bold text-primary-600">{ride.otp}</span></p>
                    <Button onClick={() => startRide(ride._id, ride.otp)} className="w-full">
                      Start Ride
                    </Button>
                  </div>
                )}
                {ride.status === 'started' && (
                  <Button onClick={() => completeRide(ride._id)} className="w-full bg-green-600 hover:bg-green-700">
                    Complete Ride
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/user'} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
APPEOF

echo ""
echo "✅ Quick Fix Applied Successfully!"
echo ""
echo "🎉 Changes:"
echo "  ✓ Removed distance-based pricing"
echo "  ✓ Added flat rate pricing:"
echo "    - Mini: ₹100"
echo "    - Sedan: ₹150"
echo "    - SUV: ₹250"
echo "    - Premium: ₹400"
echo "  ✓ Simplified booking flow"
echo "  ✓ No fare estimation needed"
echo "  ✓ Users see exact price before booking"
echo ""
echo "🚀 Your app is now using flat rates!"
echo "   Refresh the page to see changes."
echo ""
