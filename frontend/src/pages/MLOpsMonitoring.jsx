import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import {
  Settings, ShieldCheck, Activity, Target,
  Database, AlertCircle, CheckCircle2, RefreshCw,
  Cpu, Clock, TrendingUp, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';
import { getMLOpsStatus, getMLOpsMetrics } from '../utils/mockApi';

const MetricBadge = ({ value, good, bad, unit = '' }) => {
  const isGood = value >= good;
  return (
    <span className={`text-sm font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
      {value}{unit}
    </span>
  );
};

const MLOpsMonitoring = () => {
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const [statusRes, metricsRes] = await Promise.all([
        api.get('/api/mlops/status'),
        api.get('/api/mlops/metrics'),
      ]);
      setStatus(statusRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setStatus(getMLOpsStatus());
        setMetrics(getMLOpsMetrics());
      } else {
        setError('Failed to fetch MLOps monitoring data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading MLOps dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <button onClick={() => fetchData()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  const driftOk = status.data_drift_status.toLowerCase().includes('no drift') ||
                  status.data_drift_status.includes('0.0') ||
                  parseFloat(status.data_drift_status.match(/[\d.]+/)?.[0] || 0) < 0.15;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Performance & Health Monitor</h1>
          <p className="text-sm text-slate-400 mt-1">
            Forecast accuracy tracking, data stability verification, response times and pipeline health.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Cpu, label: 'Model Version', value: status.model_version,
            sub: status.model_type, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            icon: Database, label: 'Dataset Registry', value: status.dataset_version,
            sub: `Trained: ${status.training_date.split(' ')[0]}`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            icon: Activity, label: 'Data Drift', value: driftOk ? 'Healthy ✓' : 'Drift Detected',
            sub: status.data_drift_status, color: driftOk ? 'text-emerald-400' : 'text-red-400',
            bg: driftOk ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
          },
          {
            icon: Target, label: 'Total Inferences', value: status.total_predictions.toLocaleString(),
            sub: `Accuracy: ${status.prediction_accuracy}%`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-5 border ${bg}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl border ${bg} ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-lg font-extrabold ${color} truncate`}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Accuracy trend */}
        <GlassCard className="lg:col-span-2 !p-5" hover={false} delay={0.3}>
          <div className="mb-5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Accuracy & Drift History
            </h3>
            <p className="text-xs text-slate-400">7-day validation run comparison of accuracy vs data drift score</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="acc" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} domain={[88, 95]} />
                <YAxis yAxisId="drift" orientation="right" stroke="#f59e0b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 0.3]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(10,18,35,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="acc"   type="monotone" dataKey="accuracy"    name="Accuracy %"    stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                <Line yAxisId="drift" type="monotone" dataKey="drift_score" name="Drift (PSI)"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Latency area chart */}
        <GlassCard className="!p-5" hover={false} delay={0.35}>
          <div className="mb-5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Inference Latency
            </h3>
            <p className="text-xs text-slate-400">Average per-request latency in milliseconds</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,18,35,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="latency_ms" name="Latency (ms)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" dot={{ r: 3, fill: '#06b6d4' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Pipeline registry */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="!p-5" hover={false} delay={0.4}>
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Feature Registry
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {status.features_used.map(f => (
              <span key={f} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
                {f}
              </span>
            ))}
          </div>
          <div className="space-y-2.5 text-xs border-t border-white/5 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Algorithm</span>
              <span className="font-semibold text-white">XGBoost (tree_method=hist)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Framework</span>
              <span className="font-semibold text-white">Python 3.13 · scikit-learn</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Explainability</span>
              <span className="font-semibold text-white">SHAP TreeExplainer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Serving</span>
              <span className="font-semibold text-white">FastAPI · Uvicorn</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="!p-5" hover={false} delay={0.45}>
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Performance Summary
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Overall Accuracy', value: status.prediction_accuracy, max: 100, color: '#10b981', unit: '%' },
              { label: 'Precision (Class 1)', value: 75.0, max: 100, color: '#3b82f6', unit: '%' },
              { label: 'Recall (Class 1)', value: 71.0, max: 100, color: '#8b5cf6', unit: '%' },
              { label: 'F1 Score', value: 73.0, max: 100, color: '#f59e0b', unit: '%' },
            ].map(({ label, value, max, color, unit }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-bold" style={{ color }}>{value}{unit}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed border-t border-white/5 pt-3">
            * PSI drift audits run automatically every 24h against validation schema baselines.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default MLOpsMonitoring;
