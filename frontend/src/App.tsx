import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Dashboard from './Dashboard';

export default function App() {
  // Authentication and view states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // false = Login view, true = Register view
  
  // Form input states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  
  // Status and feedback states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle form submission for both login and registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (isSignUp) {
      // Registration workflow
      try {
        await axios.post('/api/auth/register', { email, username, password });
        setSuccessMessage('Account created successfully. Please sign in.');
        setIsSignUp(false); // Switch to login view on success
        setPassword('');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Authentication workflow
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password,
          totp_code: totpCode || null
        });
        localStorage.setItem('token', response.data.access_token);
        setIsAuthenticated(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Invalid credentials');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render dashboard view if authenticated
  if (isAuthenticated) {
    return <Dashboard onLogout={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 selection:text-white">
      
      {/* HEADER SECTION: Centered branding outside the card */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-4 text-white tracking-tight">
          <svg className="w-8 h-8 text-blue-500 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Secure Cloud Drive
          </h1>
        </div>
        <p className="text-sm text-slate-500 font-semibold mt-3 tracking-[0.2em] uppercase">
          End-to-end encrypted file storage
        </p>
      </div>

      {/* FORM CARD: Scaled premium container with glassmorphism effect */}
      <div className="w-full max-w-[460px] bg-slate-950/40 backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
        
        {/* INTERACTIVE NAVIGATION TABS: Smooth gliding spring animation */}
        <div className="grid grid-cols-2 bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/[0.04] backdrop-blur-md relative z-0">
          
          {/* LOGIN BUTTON */}
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSuccessMessage(''); }}
            className={`py-3 text-xs font-bold rounded-xl tracking-wider uppercase relative transition-colors duration-300 ${
              !isSignUp ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!isSignUp && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl -z-10 shadow-[0_4px_14px_rgba(59,130,246,0.3)] border border-blue-400/20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Login
          </button>

          {/* REGISTER BUTTON */}
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSuccessMessage(''); }}
            className={`py-3 text-xs font-bold rounded-xl tracking-wider uppercase relative transition-colors duration-300 ${
              isSignUp ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSignUp && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl -z-10 shadow-[0_4px_14px_rgba(59,130,246,0.3)] border border-blue-400/20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Register
          </button>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {successMessage && (
          <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
            {successMessage}
          </div>
        )}

        {/* MAIN FIELDS INPUT FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp ? (
            <>
              {/* Registration View Fields */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all duration-200"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>
            </>
          ) : (
            /* Login View Fields */
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all duration-200"
                placeholder="admin@test.com"
              />
            </div>
          )}

          {/* Shared Password Field */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          {/* Two-Factor Authentication Optional Login Field */}
          {!isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">2FA Code (if enabled)</label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all duration-200 tracking-wide"
                placeholder="123456 (optional)"
              />
            </div>
          )}

          {/* DYNAMIC ERROR ALERTS */}
          {error && <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 backdrop-blur-sm">{error}</div>}

          {/* SUBMIT BUTTON: High-end metallic volumetric style */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:from-blue-600 active:to-blue-700 text-white rounded-xl py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-xl shadow-blue-500/10 disabled:opacity-50 mt-4 border border-blue-400/20"
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
}