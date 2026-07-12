import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Brain, CloudRain, Activity,
  MapPin, Droplets, Sprout, Target,
  ArrowRight, TrendingUp, RefreshCw, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400 font-bold">{payload[0].value} mm</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [rainfallData, setRainfallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const [statsRes, rainRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/rainfall/daily')
      ]);
      setStats(statsRes.data);
      setRainfallData(rainRes.data.slice(-14)); // last 14 days
    } catch (err) {
      console.error('Dashboard fetch error', err);
      setError('Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDroughtColor = (level) => {
    if (!level) return { text: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
    const l = level.toLowerCase();
    if (l.includes('severe') || l.includes('extreme')) return { text: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    if (l.includes('moderate')) return { text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (l.includes('mild')) return { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  };

  const getRiskColor = (score) => {
    if (score >= 0.7) return { text: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    if (score >= 0.4) return { text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-2">Connection Error</h3>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button onClick={() => fetchData()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  const droughtColors = getDroughtColor(stats.drought_level);
  const riskColors = getRiskColor(stats.ai_risk_score);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold tracking-tight"
          >
            Agricultural Intelligence Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-400 mt-1 flex items-center gap-1.5"
          >
            <span className="status-dot online" />
            Live data · {currentDate}
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl glass border border-white/10 hover:bg-white/10 text-slate-300 transition-all disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/predict"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5" /> Run Prediction
          </Link>
          <Link
            to="/irrigation"
            className="hidden sm:flex items-center gap-2 glass border border-white/10 hover:bg-white/10 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
          >
            Plan Irrigation <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 8 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={AlertTriangle}
          label="Drought Level"
          value={stats.drought_level}
          colorClass={droughtColors.text}
          bgClass={droughtColors.bg}
          trend={{ text: 'SPEI Classification', value: stats.spei < 0 ? '⚠ Deficit' : '✓ Normal', positive: stats.spei >= 0 }}
          delay={0.0}
        />
        <StatCard
          icon={Brain}
          label="AI Risk Score"
          value={`${Math.round(stats.ai_risk_score * 100)}%`}
          colorClass={riskColors.text}
          bgClass={riskColors.bg}
          trend={{ text: 'Threshold: 50%', value: stats.ai_risk_score >= 0.5 ? 'At Risk' : 'Safe Zone', positive: stats.ai_risk_score < 0.5 }}
          delay={0.05}
        />
        <StatCard
          icon={CloudRain}
          label="Today's Rainfall"
          value={`${stats.todays_rainfall} mm`}
          colorClass="text-blue-400"
          bgClass="bg-blue-500/10 border-blue-500/20"
          trend={{ text: 'Last recorded', value: stats.todays_rainfall > 5 ? 'Precipitation' : 'Dry spell', positive: stats.todays_rainfall > 5 }}
          delay={0.1}
        />
        <StatCard
          icon={Activity}
          label="SPEI Index"
          value={stats.spei.toString()}
          colorClass={stats.spei < -1.0 ? 'text-red-400' : stats.spei < 0 ? 'text-amber-400' : 'text-emerald-400'}
          bgClass={stats.spei < -1.0 ? 'bg-red-500/10 border-red-500/20' : 'bg-purple-500/10 border-purple-500/20'}
          trend={{ text: 'Standardized Index', value: stats.spei < 0 ? 'Moisture Deficit' : 'Surplus', positive: stats.spei >= 0 }}
          delay={0.15}
        />
        <StatCard
          icon={MapPin}
          label="Target Region"
          value={stats.region}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10 border-emerald-500/20"
          trend={{ text: 'Climate Type', value: 'Semi-Arid Zone', positive: true }}
          delay={0.2}
        />
        <StatCard
          icon={Droplets}
          label="Water Availability"
          value={stats.water_availability}
          colorClass="text-cyan-400"
          bgClass="bg-cyan-500/10 border-cyan-500/20"
          trend={{ text: 'Reservoir Status', value: stats.water_availability.includes('Critical') ? '🔴 Critical' : '✓ Stable', positive: !stats.water_availability.includes('Critical') }}
          delay={0.25}
        />
        <StatCard
          icon={Sprout}
          label="Crop Recommendation"
          value={stats.crop_recommendation.split(' (')[0]}
          colorClass="text-lime-400"
          bgClass="bg-lime-500/10 border-lime-500/20"
          trend={{ text: 'Optimized for region', value: 'Drought Resistant', positive: true }}
          delay={0.3}
        />
        <StatCard
          icon={Target}
          label="Model Accuracy"
          value={`${stats.model_accuracy}%`}
          colorClass="text-indigo-400"
          bgClass="bg-indigo-500/10 border-indigo-500/20"
          trend={{ text: 'XGBoost Classifier', value: '✓ Production Ready', positive: true }}
          delay={0.35}
        />
      </div>

      {/* ── Charts + Alerts ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rainfall mini-chart */}
        <GlassCard className="lg:col-span-2 bg-white/3 border-white/5 !p-5" hover={false} delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Rainfall — Past 14 Days
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Satellite-derived CHIRPS precipitation estimate</p>
            </div>
            <Link to="/rainfall" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              Full Analytics →
            </Link>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rainGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Alerts panel */}
        <GlassCard className="bg-white/3 border-white/5 !p-5 flex flex-col gap-4" hover={false} delay={0.45}>
          <h3 className="text-base font-bold">🔔 Active Advisories</h3>

          <div className="space-y-3 flex-1">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                High Evaporation Risk
              </div>
              <p className="text-slate-300 leading-relaxed">
                Temperatures in <strong>{stats.region}</strong> are rising. Deploy mulch cover to preserve soil moisture levels.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
              <div className="flex items-center gap-2 font-bold text-blue-400 mb-1.5">
                <Sprout className="w-3.5 h-3.5" />
                Optimal Sowing Window
              </div>
              <p className="text-slate-300 leading-relaxed">
                SPEI deficit detected. Switch to pre-treated <strong>{stats.crop_recommendation.split(' (')[0]}</strong> seeds for drought adaptation.
              </p>
            </div>

            {stats.ai_risk_score > 0.6 && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <div className="flex items-center gap-2 font-bold text-red-400 mb-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  AI High-Risk Alert
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Model confidence is {Math.round(stats.ai_risk_score * 100)}% drought risk. Activate emergency irrigation protocol.
                </p>
              </div>
            )}
          </div>

          <Link
            to="/insights"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-semibold text-slate-300"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-500" />
            Explore AI Insights
          </Link>
        </GlassCard>
      </div>

      {/* ── Quick Nav ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/predict',   label: 'Drought Predictor', icon: Brain,          color: 'text-emerald-400' },
            { to: '/crops',     label: 'Crop Vault',        icon: Sprout,         color: 'text-lime-400' },
            { to: '/rainfall',  label: 'Rain Analytics',    icon: CloudRain,      color: 'text-blue-400' },
            { to: '/heatmap',   label: 'India Heatmap',     icon: MapPin,         color: 'text-orange-400' },
            { to: '/irrigation',label: 'Irrigation Plan',   icon: Droplets,       color: 'text-cyan-400' },
            { to: '/mlops',     label: 'MLOps Monitor',     icon: Activity,       color: 'text-purple-400' },
          ].map(({ to, label, icon: Icon, color }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              <Link
                to={to}
                className="glass glass-hover rounded-xl p-3 flex flex-col items-center gap-2 text-center border border-white/5 hover:border-white/15 transition-all group block"
              >
                <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] font-semibold text-slate-300 leading-tight">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
