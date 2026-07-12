import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Client-side password complexity check
    const hasLetter = /[a-zA-Z]/.test(cleanPassword);
    const hasNumber = /[0-9]/.test(cleanPassword);
    const hasSpecial = /[^a-zA-Z0-9\s]/.test(cleanPassword);

    if (!hasLetter || !hasNumber || !hasSpecial) {
      setError('Password must contain a combination of letters, numbers, and special characters (like @, #, $).');
      setLoading(false);
      return;
    }

    try {
      // POST to backend auth login endpoint using the configured api utility
      const response = await api.post('/api/auth/login', {
        username: cleanUsername,
        password: cleanPassword,
      });

      const { access_token, username: loggedInUser } = response.data;
      login(access_token, loggedInUser);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Connection failed. Verify if the FastAPI server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 shadow-2xl relative overflow-hidden bg-white/5 border-white/5" hover={false}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Security Portal</h2>
            <p className="text-sm text-slate-400 mt-1.5">Sign in to access DroughtGuard AI Dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin user"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-emerald-500/50 outline-none transition-all text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-emerald-500/50 outline-none transition-all text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all text-sm mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Password strength requirements instruction block */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-xs text-slate-400 font-medium">Security Requirement</span>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
              You can log in with any username. Your password must contain a combination of letters, numbers, and special characters (e.g. @, #, $, etc.).
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
