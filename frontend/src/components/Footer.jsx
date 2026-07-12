import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass border-t border-white/10 py-4 px-6 flex-shrink-0">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 mx-auto">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          <span>Smart Drought Resistance Management System</span>
          <span className="text-slate-600">•</span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
