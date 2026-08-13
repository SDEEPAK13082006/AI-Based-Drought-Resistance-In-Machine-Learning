import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';
import { CloudRain, BarChart3, TrendingUp, Calendar, Droplets, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';
import { getRainfallDaily, getRainfallMonthly, getRainfallAnnual, getRainfallComparison } from '../utils/mockApi';

const TABS = [
  { key: 'daily',      label: 'Daily Trends',       icon: Calendar,   color: 'text-blue-400' },
  { key: 'monthly',    label: 'Monthly Season',      icon: BarChart3,  color: 'text-emerald-400' },
  { key: 'annual',     label: 'Annual Timeline',     icon: TrendingUp, color: 'text-indigo-400' },
  { key: 'comparison', label: 'Region Comparison',   icon: CloudRain,  color: 'text-teal-400' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(10,18,35,0.92)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '11px',
};

const RainfallAnalytics = () => {
  const [activeTab, setActiveTab]   = useState('daily');
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchData = async (tab) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/rainfall/${tab}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        // Backend unreachable — use mock data
        const mockFns = { daily: getRainfallDaily, monthly: getRainfallMonthly, annual: getRainfallAnnual, comparison: getRainfallComparison };
        setData((mockFns[tab] || getRainfallDaily)());
      } else {
        setError('Failed to load rainfall data. Ensure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  // Compute quick summary stats
  const totalRain = data.reduce((s, d) => s + (d.rainfall || d.actual || 0), 0);
  const maxRain   = Math.max(...data.map(d => d.rainfall || d.actual || 0));
  const avgRain   = data.length ? totalRain / data.length : 0;

  const renderChart = () => {
    if (loading) return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading rainfall data...</p>
        </div>
      </div>
    );
    if (error) return (
      <div className="h-96 flex items-center justify-center text-center">
        <div>
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={() => fetchData(activeTab)} className="text-xs text-emerald-400 hover:underline">Retry</button>
        </div>
      </div>
    );

    const axisProps = { stroke: '#475569', fontSize: 11, tickLine: false, axisLine: false };

    if (activeTab === 'daily') return (
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" {...axisProps} tickFormatter={v => v.slice(5)} />
          <YAxis {...axisProps} label={{ value: 'mm', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} mm`, 'Rainfall']} />
          <ReferenceLine y={avgRain} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4" label={{ value: `Avg ${avgRain.toFixed(1)}mm`, position: 'right', fill: '#f59e0b', fontSize: 10 }} />
          <Area type="monotone" dataKey="rainfall" name="Daily Rainfall" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#dailyGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    );

    if (activeTab === 'monthly') return (
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} label={{ value: 'mm', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} mm`, 'Monthly Rainfall']} />
          <Bar dataKey="rainfall" name="Rainfall Avg" fill="url(#monthGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    );

    if (activeTab === 'annual') return (
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis {...axisProps} label={{ value: 'mm', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} mm`, 'Annual Rainfall']} />
          <ReferenceLine y={850} stroke="rgba(16,185,129,0.4)" strokeDasharray="4 4" label={{ value: 'Normal (850mm)', position: 'right', fill: '#10b981', fontSize: 10 }} />
          <Line type="monotone" dataKey="rainfall" name="Annual Total" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    );

    if (activeTab === 'comparison') return (
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="region" {...axisProps} />
          <YAxis {...axisProps} label={{ value: 'mm', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} mm`]} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="actual"             name="Current Season"    fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="historical_average" name="Historical Normal" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-400" /> Rainfall Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Satellite-derived CHIRPS precipitation analysis with regional climatological baselines.
        </p>
      </div>

      {/* Summary stats */}
      {!loading && !error && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: 'Total Recorded',  value: `${Math.round(totalRain)} mm`, color: 'text-blue-400' },
            { label: 'Period Average',  value: `${avgRain.toFixed(1)} mm`,    color: 'text-emerald-400' },
            { label: 'Peak Event',      value: `${maxRain.toFixed(1)} mm`,    color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-3.5 text-center border border-white/5">
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 gap-1">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all relative -mb-[2px] ${
              activeTab === key
                ? `border-emerald-500 ${color}`
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <GlassCard className="!p-6" hover={false}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              {TABS.filter(t => t.key === activeTab).map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <h3 className="text-base font-bold">{label}</h3>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-0.5 ml-7">
                {activeTab === 'daily'      && 'Last 30 days of satellite-estimated daily precipitation'}
                {activeTab === 'monthly'    && 'Monthly aggregated monsoon-cycle rainfall pattern'}
                {activeTab === 'annual'     && 'Decadal inter-annual rainfall trend vs 850mm normal baseline'}
                {activeTab === 'comparison' && 'Actual season totals vs historical climatological averages by region'}
              </p>
            </div>
            {renderChart()}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default RainfallAnalytics;
