import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

// ===================== ICONS =====================
const Icon = ({ d, size = 20, color = 'currentColor', fill = 'none', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const MapPin = ({ size = 20 }) => <Icon size={size} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />;
const Star = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const LogOut = ({ size = 20 }) => <Icon size={size} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />;
const User = ({ size = 20 }) => <Icon size={size} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const Mail = ({ size = 20 }) => <Icon size={size} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const Lock = ({ size = 20 }) => <Icon size={size} d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4" />;
const Phone = ({ size = 20 }) => <Icon size={size} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const Clock = ({ size = 20 }) => <Icon size={size} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2" />;
const TrendingUp = ({ size = 20 }) => <Icon size={size} d="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" />;
const DollarSign = ({ size = 20 }) => <Icon size={size} d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const CheckCircle = ({ size = 20 }) => <Icon size={size} d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" />;
const RefreshCw = ({ size = 20 }) => <Icon size={size} d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
const AlertCircle = ({ size = 20 }) => <Icon size={size} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01" />;
const XCircle = ({ size = 20 }) => <Icon size={size} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6" />;

// ===================== API =====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH CONTEXT =====================
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
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ===================== DESIGN COMPONENTS =====================
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
    accepted:  { bg: '#dbeafe', color: '#1e40af', label: '✓ Accepted' },
    started:   { bg: '#ede9fe', color: '#5b21b6', label: '🚗 In Progress' },
    completed: { bg: '#d1fae5', color: '#065f46', label: '✅ Completed' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: '✗ Cancelled' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {c.label}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
    <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ===================== LANDING =====================
function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/user');
    }
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0369a1 100%)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
        .hero-btn { transition: all 0.2s; cursor: pointer; }
        .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .feat-card { transition: all 0.25s; }
        .feat-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#3b82f6', borderRadius: 10, padding: 8 }}><CarIcon size={24} /></div>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>UCab</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none', padding: '9px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', fontWeight: 500, fontSize: 14 }} className="hero-btn">Login</Link>
          <Link to="/register" style={{ color: '#0f172a', textDecoration: 'none', padding: '9px 22px', borderRadius: 10, background: '#fff', fontWeight: 600, fontSize: 14 }} className="hero-btn">Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 20px 60px', animation: 'fadeUp 0.8s ease' }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 20, padding: '6px 16px', color: '#93c5fd', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          🚀 Fast · Safe · Affordable
        </div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(40px, 8vw, 76px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 20px' }}>
          Your Ride,<br />
          <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>On Demand</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Book reliable cabs in seconds. Track in real-time. Pay your way.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register?role=user" style={{ textDecoration: 'none', background: '#3b82f6', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16 }} className="hero-btn">
            🚖 Book a Ride
          </Link>
          <Link to="/register?role=driver" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, border: '1px solid rgba(255,255,255,0.2)' }} className="hero-btn">
            🚗 Drive with Us
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', padding: '0 40px 80px', maxWidth: 900, margin: '0 auto' }}>
        {[
          { emoji: '📍', title: 'Real-Time Tracking', desc: 'Know exactly where your driver is' },
          { emoji: '💰', title: 'Transparent Pricing', desc: 'See the fare before you book' },
          { emoji: '⭐', title: 'Rated Drivers', desc: '4.8+ average across all rides' },
          { emoji: '🔒', title: 'OTP Verified', desc: 'Safe ride start with secure OTP' },
        ].map((f, i) => (
          <div key={i} className="feat-card" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '24px 28px', textAlign: 'center', minWidth: 180, flex: '1 1 180px', maxWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.emoji}</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== AUTH PAGES =====================
function InputField({ label, icon: IconComp, error, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {IconComp && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <IconComp size={16} />
          </div>
        )}
        <input
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: IconComp ? '11px 14px 11px 38px' : '11px 14px',
            borderRadius: 10, border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
            fontSize: 14, outline: 'none', background: '#fff', color: '#111',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'}
          {...props}
        />
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function AuthCard({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: '40px 36px', width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ background: '#3b82f6', borderRadius: 10, padding: 8 }}><CarIcon size={22} /></div>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>UCab</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
          {subtitle && <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, onClick, type = 'button', disabled, variant = 'primary', style: extraStyle = {} }) {
  const base = { padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.2s', opacity: disabled ? 0.6 : 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 };
  const variants = {
    primary: { background: '#3b82f6', color: '#fff' },
    success: { background: '#10b981', color: '#fff' },
    danger:  { background: '#ef4444', color: '#fff' },
    ghost:   { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' },
    outline: { background: 'transparent', color: '#3b82f6', border: '2px solid #3b82f6' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...extraStyle }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.9)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
      {children}
    </button>
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
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}!`);
      if (u.role === 'admin') navigate('/admin');
      else if (u.role === 'driver') navigate('/driver');
      else navigate('/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to continue">
      <form onSubmit={handleSubmit}>
        <InputField label="Email" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <InputField label="Password" icon={Lock} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <Btn type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</Btn>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 }}>
        No account? <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
      </p>
    </AuthCard>
  );
}

function Register() {
  const location = useLocation();
  const defaultRole = new URLSearchParams(location.search).get('role') || 'user';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: defaultRole, licenseNumber: '', vehicleType: 'sedan', vehicleNumber: '', vehicleModel: '', vehicleColor: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone.length !== 10) { toast.error('Phone must be exactly 10 digits'); return; }
    setLoading(true);
    try {
      const u = await register(form);
      toast.success('Account created!');
      if (u.role === 'admin') navigate('/admin');
      else if (u.role === 'driver') navigate('/driver');
      else navigate('/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const isDriver = form.role === 'driver';
  const tabStyle = (active) => ({
    flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
    background: active ? '#3b82f6' : '#f3f4f6', color: active ? '#fff' : '#6b7280'
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: '36px', width: '100%', maxWidth: 580 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ background: '#3b82f6', borderRadius: 10, padding: 8 }}><CarIcon size={22} /></div>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>UCab</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Create Account</h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>Join us today</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={tabStyle(form.role === 'user')} onClick={() => setForm(f => ({ ...f, role: 'user' }))}>👤 Passenger</button>
          <button style={tabStyle(isDriver)} onClick={() => setForm(f => ({ ...f, role: 'driver' }))}>🚗 Driver</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <InputField label="Full Name" icon={User} name="name" value={form.name} onChange={set('name')} required />
            <InputField label="Email" icon={Mail} type="email" name="email" value={form.email} onChange={set('email')} required />
            <InputField label="Phone (10 digits)" icon={Phone} name="phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" maxLength={10} required />
            <InputField label="Password" icon={Lock} type="password" name="password" value={form.password} onChange={set('password')} required />
          </div>
          {isDriver && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, marginTop: 8 }}>
              <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <InputField label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={set('licenseNumber')} required={isDriver} />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Vehicle Type</label>
                  <select value={form.vehicleType} onChange={set('vehicleType')} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fff' }}>
                    <option value="mini">Mini</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <InputField label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={set('vehicleNumber')} placeholder="MH12AB1234" required={isDriver} />
                <InputField label="Vehicle Model" name="vehicleModel" value={form.vehicleModel} onChange={set('vehicleModel')} placeholder="Toyota Camry" required={isDriver} />
                <InputField label="Vehicle Color" name="vehicleColor" value={form.vehicleColor} onChange={set('vehicleColor')} placeholder="Black" required={isDriver} />
              </div>
            </div>
          )}
          <Btn type="submit" disabled={loading}>{loading ? 'Creating Account…' : 'Create Account'}</Btn>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, color: '#6b7280', fontSize: 14 }}>
          Have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}


// ===================== MAP COMPONENTS (Leaflet + OpenStreetMap) =====================

// LocationSearch with Nominatim autocomplete
function LocationSearch({ label, value, placeholder, color, onSelect, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const search = async (query) => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'UCab-App' }
      });
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {}
    finally { setSearching(false); }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 400);
  };

  const handleSelect = (item) => {
    const addr = item.display_name.split(',').slice(0, 3).join(',');
    onSelect(addr, parseFloat(item.lat), parseFloat(item.lon));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        <span style={{ color }}>{label === 'Pickup Location' ? '🟢' : '🔴'}</span> {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', padding: '11px 40px 11px 14px', borderRadius: 10, border: `2px solid ${color}40`, fontSize: 14, outline: 'none', background: '#fff', transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.target.style.borderColor = color}
          onBlurCapture={e => e.target.style.borderColor = `${color}40`}
        />
        {searching && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1000, maxHeight: 220, overflowY: 'auto' }}>
          {suggestions.map((item, i) => (
            <div key={i} onClick={() => handleSelect(item)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ color, flexShrink: 0, marginTop: 1 }}>📍</span>
              <span style={{ color: '#374151', lineHeight: 1.4 }}>{item.display_name.split(',').slice(0, 4).join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// MapView using Leaflet loaded from CDN
function MapView({ pickupLat, pickupLng, dropLat, dropLng, showRoute, onPickupSelect, onDropSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const [mapMode, setMapMode] = useState('pickup'); // 'pickup' or 'drop'
  const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapContainerRef.current).setView([18.5204, 73.8567], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const greenIcon = L.divIcon({ html: '<div style="width:16px;height:16px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8], className: '' });
    const redIcon = L.divIcon({ html: '<div style="width:16px;height:16px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8], className: '' });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocode
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'User-Agent': 'UCab-App' } });
        const data = await res.json();
        const addr = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const mode = map._ucabMode || 'pickup';
        if (mode === 'pickup') {
          if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
          pickupMarkerRef.current = L.marker([lat, lng], { icon: greenIcon }).addTo(map).bindPopup('📍 Pickup').openPopup();
          onPickupSelect(lat, lng, addr);
        } else {
          if (dropMarkerRef.current) map.removeLayer(dropMarkerRef.current);
          dropMarkerRef.current = L.marker([lat, lng], { icon: redIcon }).addTo(map).bindPopup('🏁 Drop').openPopup();
          onDropSelect(lat, lng, addr);
        }
      } catch {
        const mode = map._ucabMode || 'pickup';
        const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (mode === 'pickup') { onPickupSelect(lat, lng, addr); }
        else { onDropSelect(lat, lng, addr); }
      }
    });

    mapInstanceRef.current = map;
    map._ucabMode = 'pickup';
  }, [leafletLoaded]);

  // Update mode on map instance
  useEffect(() => {
    if (mapInstanceRef.current) mapInstanceRef.current._ucabMode = mapMode;
  }, [mapMode]);

  // Update markers when coords change
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const greenIcon = L.divIcon({ html: '<div style="width:16px;height:16px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8], className: '' });
    const redIcon = L.divIcon({ html: '<div style="width:16px;height:16px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8], className: '' });

    if (pickupLat && pickupLng) {
      if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = L.marker([pickupLat, pickupLng], { icon: greenIcon }).addTo(map).bindPopup('📍 Pickup');
    }
    if (dropLat && dropLng && showRoute) {
      if (dropMarkerRef.current) map.removeLayer(dropMarkerRef.current);
      dropMarkerRef.current = L.marker([dropLat, dropLng], { icon: redIcon }).addTo(map).bindPopup('🏁 Drop');
      // Draw line between pickup and drop
      if (routeLineRef.current) map.removeLayer(routeLineRef.current);
      routeLineRef.current = L.polyline([[pickupLat, pickupLng], [dropLat, dropLng]], { color: '#3b82f6', weight: 4, dashArray: '8,8', opacity: 0.7 }).addTo(map);
      // Fit map to show both markers
      map.fitBounds([[pickupLat, pickupLng], [dropLat, dropLng]], { padding: [40, 40] });
    } else if (pickupLat && pickupLng) {
      map.setView([pickupLat, pickupLng], 14);
    }
  }, [leafletLoaded, pickupLat, pickupLng, dropLat, dropLng, showRoute]);

  if (!leafletLoaded) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Mode selector */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 6, background: '#fff', padding: 6, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <button onClick={() => setMapMode('pickup')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: mapMode === 'pickup' ? '#10b981' : '#f3f4f6', color: mapMode === 'pickup' ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
          🟢 Set Pickup
        </button>
        <button onClick={() => setMapMode('drop')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: mapMode === 'drop' ? '#ef4444' : '#f3f4f6', color: mapMode === 'drop' ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
          🔴 Set Drop
        </button>
      </div>
      <div ref={mapContainerRef} style={{ height: 350, width: '100%' }} />
    </div>
  );
}

// ===================== USER DASHBOARD =====================
function UserDashboard() {
  const [tab, setTab] = useState('book');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [fare, setFare] = useState(null);
  const [booking, setBooking] = useState({ pickupAddress: '', dropAddress: '', pickupLat: 18.5204, pickupLng: 73.8567, dropLat: 18.4625, dropLng: 73.8229, vehicleType: 'sedan' });
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const pickupMarker = useRef(null);
  const dropMarker = useRef(null);
  const routeLine = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    fetchRides();
    pollRef.current = setInterval(fetchRides, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/my-rides');
      setRides(data.data);
    } catch {}
  };

  const estimateFare = async () => {
    if (!booking.pickupAddress || !booking.dropAddress) { toast.error('Enter pickup and drop locations'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/rides/estimate', {
        pickupLocation: { coordinates: [booking.pickupLng, booking.pickupLat], address: booking.pickupAddress },
        dropLocation: { coordinates: [booking.dropLng, booking.dropLat], address: booking.dropAddress },
        vehicleType: booking.vehicleType
      });
      setFare(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to estimate fare');
    } finally { setLoading(false); }
  };

  const bookRide = async () => {
    setLoading(true);
    try {
      await api.post('/rides', {
        pickupLocation: { coordinates: [booking.pickupLng, booking.pickupLat], address: booking.pickupAddress },
        dropLocation: { coordinates: [booking.dropLng, booking.dropLat], address: booking.dropAddress },
        vehicleType: booking.vehicleType, paymentMethod: 'cash'
      });
      toast.success('🎉 Ride booked! Waiting for a driver…');
      setFare(null);
      fetchRides();
      setTab('rides');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const cancelRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/cancel`, { reason: 'User cancelled' });
      toast.success('Ride cancelled');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const rateRide = async (rideId, rating) => {
    try {
      await api.put(`/rides/${rideId}/rate`, { rating, comment: 'Great ride!' });
      toast.success('Thanks for rating!');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rating failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out'); };

  const tabBtn = (active) => ({
    padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#6b7280',
    boxShadow: active ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
  });

  const activeRide = rides.find(r => ['pending','accepted','started'].includes(r.status));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#3b82f6', borderRadius: 8, padding: 6 }}><CarIcon size={20} /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>UCab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', borderRadius: 10, padding: '6px 14px' }}>
            <User size={16} /><span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {/* Active ride alert */}
        {activeRide && (
          <div style={{ background: activeRide.status === 'pending' ? '#fef3c7' : activeRide.status === 'accepted' ? '#dbeafe' : '#ede9fe', border: `1px solid ${activeRide.status === 'pending' ? '#f59e0b' : '#3b82f6'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <StatusBadge status={activeRide.status} />
              <p style={{ margin: '6px 0 0', fontWeight: 600, color: '#0f172a', fontSize: 15 }}>
                {activeRide.status === 'pending' && '⏳ Looking for a driver nearby…'}
                {activeRide.status === 'accepted' && `✅ Driver accepted! Share OTP: `}
                {activeRide.status === 'started' && '🚗 Your ride is in progress!'}
                {activeRide.status === 'accepted' && <strong style={{ color: '#1d4ed8', fontSize: 18 }}> {activeRide.otp}</strong>}
              </p>
              {activeRide.driver && activeRide.driver.user && (
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
                  Driver: {activeRide.driver.user.name} · {activeRide.driver.vehicleModel} · {activeRide.driver.vehicleColor}
                </p>
              )}
            </div>
            {activeRide.status === 'pending' && (
              <button onClick={() => cancelRide(activeRide._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancel Ride
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button style={tabBtn(tab === 'book')} onClick={() => setTab('book')}><MapPin size={16} /> Book Ride</button>
          <button style={tabBtn(tab === 'rides')} onClick={() => setTab('rides')}>
            <Clock size={16} /> My Rides {rides.length > 0 && <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: 11 }}>{rides.length}</span>}
          </button>
        </div>

        {/* BOOK TAB */}
        {tab === 'book' && (
          <div>
            {/* Map */}
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20 }}>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <MapView
                pickupLat={booking.pickupLat} pickupLng={booking.pickupLng}
                dropLat={booking.dropLat} dropLng={booking.dropLng}
                showRoute={!!(booking.pickupAddress && booking.dropAddress)}
                onPickupSelect={(lat, lng, addr) => { setBooking(b => ({ ...b, pickupLat: lat, pickupLng: lng, pickupAddress: addr })); setFare(null); }}
                onDropSelect={(lat, lng, addr) => { setBooking(b => ({ ...b, dropLat: lat, dropLng: lng, dropAddress: addr })); setFare(null); }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {/* Booking Form */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>📍 Book Your Ride</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280', background: '#f0f9ff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                  💡 Type to search locations, or click on the map to set pickup/drop points
                </p>
                <LocationSearch
                  label="Pickup Location"
                  value={booking.pickupAddress}
                  placeholder="e.g. Shivaji Nagar, Pune"
                  color="#10b981"
                  onSelect={(addr, lat, lng) => { setBooking(b => ({ ...b, pickupAddress: addr, pickupLat: lat, pickupLng: lng })); setFare(null); }}
                  onChange={v => { setBooking(b => ({ ...b, pickupAddress: v })); setFare(null); }}
                />
                <LocationSearch
                  label="Drop Location"
                  value={booking.dropAddress}
                  placeholder="e.g. VIT, Upper Indira Nagar"
                  color="#ef4444"
                  onSelect={(addr, lat, lng) => { setBooking(b => ({ ...b, dropAddress: addr, dropLat: lat, dropLng: lng })); setFare(null); }}
                  onChange={v => { setBooking(b => ({ ...b, dropAddress: v })); setFare(null); }}
                />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Vehicle Type</label>
                  <select value={booking.vehicleType} onChange={e => { setBooking(b => ({ ...b, vehicleType: e.target.value })); setFare(null); }} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fff' }}>
                    <option value="mini">🚘 Mini — ₹10/km</option>
                    <option value="sedan">🚗 Sedan — ₹15/km</option>
                    <option value="suv">🚙 SUV — ₹20/km</option>
                    <option value="premium">🏎 Premium — ₹30/km</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn onClick={estimateFare} disabled={loading} variant="ghost" style={{ flex: 1 }}>
                    {loading ? '…' : '💰 Estimate Fare'}
                  </Btn>
                  <Btn onClick={bookRide} disabled={loading || !fare} style={{ flex: 1 }}>
                    {loading ? '…' : '🚖 Book Now'}
                  </Btn>
                </div>
              </div>

              {/* Fare Card */}
              {fare ? (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>💰 Fare Estimate</h3>
                  {[
                    ['📏 Distance', `${fare.distance} km`],
                    ['⏱ Duration', `~${fare.duration} min`],
                    ['🏁 Base Fare', `₹${fare.fare.baseFare}`],
                    ['🛣 Distance Fare', `₹${fare.fare.distanceFare}`],
                    ['🧾 Tax', `₹${fare.fare.tax}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#6b7280', fontSize: 14 }}>{k}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#eff6ff', borderRadius: 12, marginTop: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#1e40af' }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 24, color: '#2563eb' }}>₹{fare.fare.total}</span>
                  </div>
                  <p style={{ margin: '12px 0 0', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>Click "Book Now" to confirm your ride</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#9ca3af' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗺</div>
                  <p style={{ fontWeight: 600, color: '#6b7280', margin: '0 0 6px' }}>Pick locations on the map</p>
                  <p style={{ fontSize: 13, margin: 0 }}>Or type addresses above, then tap Estimate</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIDES TAB */}
        {tab === 'rides' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>My Rides</h3>
              <button onClick={fetchRides} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            {rides.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🚖</div>
                <p style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: '0 0 8px' }}>No rides yet</p>
                <p style={{ color: '#6b7280', margin: 0 }}>Book your first ride and it'll appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rides.map(ride => (
                  <div key={ride._id} style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <StatusBadge status={ride.status} />
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(ride.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>₹{ride.fare.total}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{ride.distance} km · {ride.vehicleType}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 5, flexShrink: 0 }} />
                        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Pickup</div><div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{ride.pickupLocation.address}</div></div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginTop: 5, flexShrink: 0 }} />
                        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Drop</div><div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{ride.dropLocation.address}</div></div>
                      </div>
                    </div>

                    {/* OTP for accepted rides */}
                    {ride.status === 'accepted' && (
                      <div style={{ marginTop: 12, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>Share OTP with driver:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: '#2563eb', letterSpacing: 3 }}>{ride.otp}</span>
                      </div>
                    )}

                    {/* Driver info */}
                    {ride.driver && ride.driver.user && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#374151' }}>
                        🧑‍✈️ <strong>{ride.driver.user.name}</strong> · {ride.driver.vehicleModel} ({ride.driver.vehicleColor}) · ⭐ {ride.driver.rating}
                      </div>
                    )}

                    {/* Rating */}
                    {ride.status === 'completed' && !ride.rating?.value && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Rate this ride:</p>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1,2,3,4,5].map(r => (
                            <button key={r} onClick={() => rateRide(ride._id, r)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transform: 'scale(1)', transition: 'transform 0.1s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                              <Star size={28} filled />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {ride.status === 'completed' && ride.rating?.value && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Your rating:</span>
                        {[...Array(ride.rating.value)].map((_, i) => <Star key={i} size={16} filled />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== DRIVER DASHBOARD =====================
function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchRides();
    pollRef.current = setInterval(() => { fetchProfile(); fetchRides(); }, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchProfile = async () => {
    try { const { data } = await api.get('/drivers/profile'); setProfile(data.data); } catch {}
  };

  const fetchRides = async () => {
    try { const { data } = await api.get('/rides/driver-rides'); setRides(data.data); } catch {}
  };

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      await api.put('/drivers/availability');
      await fetchProfile();
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const acceptRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/accept`);
      toast.success('✅ Ride accepted! Head to pickup location.');
      fetchRides(); fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot accept ride');
    }
  };

  const startRide = async (rideId) => {
    const otp = otpInputs[rideId];
    if (!otp) { toast.error('Enter the OTP from the passenger'); return; }
    try {
      await api.put(`/rides/${rideId}/start`, { otp });
      toast.success('🚗 Ride started!');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const completeRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/complete`);
      toast.success('🎉 Ride completed! Payment received.');
      fetchRides(); fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out'); };

  const pendingRides = rides.filter(r => r.status === 'pending');
  const activeRide = rides.find(r => ['accepted','started'].includes(r.status));
  const completedRides = rides.filter(r => r.status === 'completed');

  const isVerified = profile?.isVerified;
  const isOnline = profile?.isAvailable;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#3b82f6', borderRadius: 8, padding: 6 }}><CarIcon size={20} /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>UCab <span style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600 }}>Driver</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile && (
            <button onClick={toggleAvailability} disabled={loading || !isVerified} style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: (!isVerified || loading) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13,
              background: isOnline ? '#10b981' : '#6b7280', color: '#fff', opacity: (!isVerified || loading) ? 0.6 : 1, transition: 'all 0.2s'
            }}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: '6px 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
            <User size={15} /> {user?.name}
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {/* Verification Warning */}
        {profile && !isVerified && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: 15 }}>Account Pending Verification</p>
              <p style={{ margin: '4px 0 0', color: '#b45309', fontSize: 13 }}>Admin needs to verify your account. You cannot accept rides until verified. Ask your admin to verify you via the admin panel or API.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {profile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Rides', value: profile.totalRides, icon: '🚗', color: '#3b82f6' },
              { label: 'Earnings', value: `₹${profile.earnings}`, icon: '💰', color: '#10b981' },
              { label: 'Rating', value: `${profile.rating} ⭐`, icon: '⭐', color: '#f59e0b' },
              { label: 'Status', value: isVerified ? '✓ Verified' : '⏳ Pending', icon: isVerified ? '✅' : '⏳', color: isVerified ? '#10b981' : '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            ))}
          </div>
        )}

        {/* Active Ride */}
        {activeRide && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, border: '2px solid #3b82f6', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>🚗 Active Ride</h3>
              <StatusBadge status={activeRide.status} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 5, flexShrink: 0 }} />
                <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>PICKUP</div><div style={{ fontSize: 14, fontWeight: 600 }}>{activeRide.pickupLocation.address}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginTop: 5, flexShrink: 0 }} />
                <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>DROP</div><div style={{ fontSize: 14, fontWeight: 600 }}>{activeRide.dropLocation.address}</div></div>
              </div>
            </div>
            {activeRide.user && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>👤 Passenger: <strong>{activeRide.user.name}</strong> · 📞 {activeRide.user.phone}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Fare</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#10b981' }}>₹{activeRide.fare.total}</span>
            </div>
            {activeRide.status === 'accepted' && (
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Ask passenger for OTP to start ride:</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    placeholder="Enter 4-digit OTP"
                    value={otpInputs[activeRide._id] || ''}
                    onChange={e => setOtpInputs(o => ({ ...o, [activeRide._id]: e.target.value }))}
                    maxLength={4}
                    style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 16, fontFamily: 'monospace', letterSpacing: 3, outline: 'none', textAlign: 'center' }}
                  />
                  <button onClick={() => startRide(activeRide._id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Start
                  </button>
                </div>
              </div>
            )}
            {activeRide.status === 'started' && (
              <button onClick={() => completeRide(activeRide._id)} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                ✅ Complete Ride & Collect ₹{activeRide.fare.total}
              </button>
            )}
          </div>
        )}

        {/* Pending Ride Requests */}
        {isVerified && isOnline && pendingRides.length > 0 && !activeRide && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              📥 New Ride Requests
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 12, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>{pendingRides.length}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingRides.map(ride => (
                <div key={ride._id} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '2px solid #dbeafe', animation: 'pulse 2s infinite' }}>
                  <style>{`@keyframes pulse { 0%,100%{border-color:#dbeafe} 50%{border-color:#3b82f6} }`}</style>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(ride.createdAt).toLocaleTimeString()}</span>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>🚗 {ride.vehicleType} · {ride.distance} km</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>₹{ride.fare.total}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>From:</span>
                      <span style={{ color: '#374151' }}>{ride.pickupLocation.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>To:</span>
                      <span style={{ color: '#374151' }}>{ride.dropLocation.address}</span>
                    </div>
                  </div>
                  <button onClick={() => acceptRide(ride._id)} style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                    ✓ Accept Ride
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline/Unverified state */}
        {isVerified && !isOnline && !activeRide && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '50px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔴</div>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: '0 0 8px' }}>You're Offline</p>
            <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: 14 }}>Go online to start receiving ride requests</p>
            <button onClick={toggleAvailability} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
              Go Online
            </button>
          </div>
        )}

        {isVerified && isOnline && pendingRides.length === 0 && !activeRide && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '50px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20 }}>
            <Spinner />
            <p style={{ fontWeight: 600, color: '#374151', margin: '12px 0 4px' }}>Waiting for ride requests…</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Auto-refreshing every 5 seconds</p>
          </div>
        )}

        {/* Completed Rides History */}
        {completedRides.length > 0 && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>📋 Completed Rides</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {completedRides.map(ride => (
                <div key={ride._id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <StatusBadge status={ride.status} />
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{ride.pickupLocation.address} → {ride.dropLocation.address}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{new Date(ride.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>₹{ride.fare.total}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{ride.distance} km</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== PROTECTED ROUTE =====================
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'driver') return <Navigate to="/driver" />;
    return <Navigate to="/user" />;
  }
  return children;
}

// ===================== APP =====================
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: 10, fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: 14 } }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ===================== ADMIN DASHBOARD =====================
function AdminDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [tab, setTab] = useState('drivers');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchDrivers(); fetchAllRides(); }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try { const { data } = await api.get('/drivers'); setDrivers(data.data); }
    catch (err) { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const fetchAllRides = async () => {
    try {
      // Get rides for all users by fetching all driver rides + user rides
      // Use admin token to get all pending rides
      const { data } = await api.get('/rides/driver-rides');
      setRides(data.data || []);
    } catch {}
  };

  const verifyDriver = async (driverId, driverName) => {
    setVerifying(v => ({ ...v, [driverId]: true }));
    try {
      await api.put(`/drivers/${driverId}/verify`);
      toast.success(`✅ ${driverName} verified successfully!`);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(v => ({ ...v, [driverId]: false }));
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out'); };

  const unverified = drivers.filter(d => !d.isVerified);
  const verified = drivers.filter(d => d.isVerified);

  const tabBtn = (active) => ({
    padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    background: active ? '#7c3aed' : '#fff', color: active ? '#fff' : '#6b7280',
    boxShadow: active ? '0 4px 12px rgba(124,58,237,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#1e1b4b', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#7c3aed', borderRadius: 8, padding: 6 }}><CarIcon size={20} /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>UCab <span style={{ color: '#a78bfa', fontSize: 13 }}>Admin</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', color: '#e0e7ff', fontSize: 14, fontWeight: 600 }}>
            👑 {user?.name}
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#e0e7ff' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Drivers', value: drivers.length, icon: '🚗', color: '#7c3aed' },
            { label: 'Verified', value: verified.length, icon: '✅', color: '#10b981' },
            { label: 'Pending Verify', value: unverified.length, icon: '⏳', color: '#f59e0b', alert: unverified.length > 0 },
            { label: 'Online Now', value: drivers.filter(d => d.isAvailable && d.isVerified).length, icon: '🟢', color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: s.alert ? '0 0 0 2px #f59e0b' : '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
              <div style={{ fontSize: 30 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Alert for unverified drivers */}
        {unverified.length > 0 && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#92400e' }}>
                {unverified.length} driver{unverified.length > 1 ? 's' : ''} waiting for verification
              </p>
              <p style={{ margin: '3px 0 0', color: '#b45309', fontSize: 13 }}>
                Drivers cannot accept rides until verified. Review and verify below.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button style={tabBtn(tab === 'drivers')} onClick={() => setTab('drivers')}>
            🚗 All Drivers ({drivers.length})
          </button>
          <button style={tabBtn(tab === 'pending')} onClick={() => setTab('pending')}>
            ⏳ Pending Verification
            {unverified.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 12, padding: '1px 8px', fontSize: 11 }}>{unverified.length}</span>}
          </button>
        </div>

        {/* DRIVERS TAB */}
        {tab === 'drivers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>All Registered Drivers</h3>
              <button onClick={fetchDrivers} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            {loading ? <Spinner /> : drivers.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: '50px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
                <p style={{ fontWeight: 600 }}>No drivers registered yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {drivers.map(driver => (
                  <DriverCard key={driver._id} driver={driver} onVerify={verifyDriver} verifying={verifying[driver._id]} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PENDING TAB */}
        {tab === 'pending' && (
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Drivers Awaiting Verification
            </h3>
            {unverified.length === 0 ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, color: '#15803d', fontSize: 18, margin: '0 0 6px' }}>All Caught Up!</p>
                <p style={{ color: '#16a34a', margin: 0, fontSize: 14 }}>No drivers pending verification right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {unverified.map(driver => (
                  <DriverCard key={driver._id} driver={driver} onVerify={verifyDriver} verifying={verifying[driver._id]} highlight />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverCard({ driver, onVerify, verifying, highlight }) {
  const [expanded, setExpanded] = useState(false);
  const u = driver.user || {};

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      boxShadow: highlight ? '0 4px 16px rgba(245,158,11,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
      border: highlight ? '2px solid #fde68a' : '1px solid #f1f5f9',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {/* Left info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: driver.isVerified ? '#d1fae5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {driver.isVerified ? '✅' : '⏳'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{u.name || 'Unknown'}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              📧 {u.email} &nbsp;·&nbsp; 📞 {u.phone}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              🚗 {driver.vehicleModel} ({driver.vehicleColor}) · {driver.vehicleType?.toUpperCase()}
            </div>
          </div>
        </div>
        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: driver.isVerified ? '#d1fae5' : '#fef3c7',
              color: driver.isVerified ? '#065f46' : '#92400e'
            }}>
              {driver.isVerified ? '✓ Verified' : '⏳ Pending'}
            </span>
            <span style={{ fontSize: 12, color: driver.isAvailable ? '#10b981' : '#9ca3af', fontWeight: 600 }}>
              {driver.isAvailable ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          {!driver.isVerified && (
            <button
              onClick={() => onVerify(driver._id, u.name)}
              disabled={verifying}
              style={{
                background: verifying ? '#9ca3af' : '#10b981', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 10, cursor: verifying ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                boxShadow: verifying ? 'none' : '0 4px 12px rgba(16,185,129,0.3)'
              }}
              onMouseEnter={e => { if (!verifying) e.currentTarget.style.background = '#059669'; }}
              onMouseLeave={e => { if (!verifying) e.currentTarget.style.background = '#10b981'; }}
            >
              {verifying ? '⏳ Verifying…' : '✓ Verify Driver'}
            </button>
          )}
          <button onClick={() => setExpanded(x => !x)} style={{ background: '#f3f4f6', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
            {expanded ? '▲ Less' : '▼ Details'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            ['License Number', driver.licenseNumber],
            ['Vehicle Number', driver.vehicleNumber],
            ['Vehicle Type', driver.vehicleType],
            ['Total Rides', driver.totalRides],
            ['Earnings', `₹${driver.earnings}`],
            ['Rating', `${driver.rating} ⭐`],
            ['Registered', new Date(driver.createdAt).toLocaleDateString()],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}