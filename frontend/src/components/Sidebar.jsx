import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Brain, Sprout, CloudRain,
  Map, Droplets, Lightbulb, Settings,
  ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU = [
  { name: 'Dashboard',         path: '/dashboard', icon: LayoutDashboard,  color: 'text-emerald-400' },
  { name: 'Drought Predictor', path: '/predict',   icon: Brain,            color: 'text-red-400' },
  { name: 'Crop Vault',        path: '/crops',     icon: Sprout,           color: 'text-lime-400' },
  { name: 'Rainfall Charts',   path: '/rainfall',  icon: CloudRain,        color: 'text-blue-400' },
  { name: 'India Heatmap',     path: '/heatmap',   icon: Map,              color: 'text-orange-400' },
  { name: 'Irrigation Plan',   path: '/irrigation',icon: Droplets,         color: 'text-cyan-400' },
  { name: 'AI Insights',       path: '/insights',  icon: Lightbulb,        color: 'text-amber-400' },
  { name: 'MLOps Monitor',     path: '/mlops',     icon: Activity,         color: 'text-purple-400' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="glass border-r border-white/8 flex flex-col flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 self-start hidden md:flex z-40 overflow-hidden"
    >
      {/* Navigation items */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2.5 overflow-y-auto">
        {MENU.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${isActive
                ? 'bg-gradient-to-r from-emerald-500/15 to-blue-500/10 border border-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                : 'hover:bg-white/5 border border-transparent'}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-r-full" />
                )}

                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className={`text-xs font-medium truncate ${isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Collapsed tooltip */}
                {collapsed && (
                  <div className="absolute left-14 hidden group-hover:flex glass px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white whitespace-nowrap shadow-2xl z-50 border border-white/10 pointer-events-none">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white/10" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="p-3 border-t border-white/8 hover:bg-white/5 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-300 flex-shrink-0"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4" />
          : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
