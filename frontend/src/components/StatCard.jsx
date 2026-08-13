import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, value, label, trend, colorClass = 'text-emerald-500', bgClass = 'bg-emerald-500/10 border-emerald-500/20', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass glass-hover rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative group"
    >
      {/* Background shimmer on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none bg-gradient-to-br from-white/5 to-transparent`} />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">{label}</span>
          <span className="text-xl font-extrabold tracking-tight truncate mt-1" title={value}>{value}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${bgClass} ${colorClass} transition-all group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 truncate">{trend.text}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
            trend.positive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {trend.value}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
