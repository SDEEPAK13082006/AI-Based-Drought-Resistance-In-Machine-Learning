import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <nav className="glass sticky top-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-2xl">🌾</span>
          <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            DroughtGuard AI
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
          aria-label="Toggle theme"
        >
          {isDarkMode 
            ? <Sun className="w-4 h-4 text-amber-400" /> 
            : <Moon className="w-4 h-4 text-blue-600" />
          }
        </button>

        {isAuthenticated && (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user ? user[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-medium">{user || 'Admin'}</span>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="glass absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl z-20 border border-white/10"
                  >
                    <div className="px-4 py-2.5 border-b border-white/5 bg-white/5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{user || 'admin'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      id="logout-btn"
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {!isAuthenticated && (
          <Link
            to="/login"
            className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
