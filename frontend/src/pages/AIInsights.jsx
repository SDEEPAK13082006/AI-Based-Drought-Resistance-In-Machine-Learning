import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { Lightbulb, Brain, AlertTriangle, Zap, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const REGIONS = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer'];

const FEATURE_LABELS = {
  rainfall: 'Rainfall',
  temperature: 'Temperature',
  humidity: 'Humidity',
  soil_moisture: 'Soil Moisture',
  region: 'Region',
};

const SliderRow = ({ label, value, min, max, unit, onChange, color = 'text-emerald-400' }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider">
      <span className="text-slate-400">{label}</span>
      <span className={color}>{value} {unit}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const AIInsights = () => {
  const [region, setRegion]           = useState('Bundelkhand');
  const [rainfall, setRainfall]       = useState(120);
  const [temperature, setTemperature] = useState(38);
  const [humidity, setHumidity]       = useState(30);
  const [soilMoisture, setSoilMoisture] = useState(25);

  const [loading, setLoading]             = useState(false);
  const [globalImportance, setGlobalImportance] = useState([]);
  const [shapData, setShapData]           = useState([]);
  const [explanation, setExplanation]     = useState('');
  const [topFactors, setTopFactors]       = useState([]);
  const [droughtProb, setDroughtProb]     = useState(null);
  const [error, setError]                 = useState('');

  const debounceRef = useRef(null);

  const fetchInsights = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/insights', params);
      const d = res.data;

      setExplanation(d.explanation);
      setTopFactors(d.top_factors);

      const gi = Object.entries(d.feature_importance).map(([k, v]) => ({
        name: FEATURE_LABELS[k] || k,
        importance: Math.round(v * 100 * 10) / 10,
      }));
      setGlobalImportance(gi);

      const sv = Object.entries(d.shap_values).map(([k, v]) => ({
        name: FEATURE_LABELS[k] || k,
        val: Math.round(v * 1000) / 1000,
      }));
      setShapData(sv);

      // Rough drought probability from SHAP sum sign
      const shapSum = sv.reduce((acc, s) => acc + s.val, 0);
      setDroughtProb(Math.min(1, Math.max(0, 0.5 + shapSum * 0.15)));
    } catch (err) {
      console.error(err);
      setError('Could not compute SHAP values. Ensure backend & model are online.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced trigger
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchInsights({ region, rainfall, temperature, humidity, soil_moisture: soilMoisture });
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [region, rainfall, temperature, humidity, soilMoisture, fetchInsights]);

  const riskColor = droughtProb !== null
    ? droughtProb >= 0.65 ? '#ef4444' : droughtProb >= 0.4 ? '#f59e0b' : '#10b981'
    : '#10b981';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Explainability & SHAP Insights</h1>
        <p className="text-sm text-slate-400 mt-1">
          Understand model decisions via SHapley Additive exPlanations — real-time as you adjust parameters.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Simulator */}
        <div className="space-y-4">
          <GlassCard className="!p-5" hover={false}>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-500" /> Scenario Simulator
            </h3>
            <p className="text-[10px] text-slate-500 mb-5 leading-relaxed">
              Adjust any parameter below — charts update automatically (600ms debounce).
            </p>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none text-xs focus:border-emerald-500/50"
                >
                  {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>

              <SliderRow label="Rainfall" value={rainfall}     min={0}   max={500} unit="mm" onChange={setRainfall}     color="text-blue-400" />
              <SliderRow label="Temperature" value={temperature} min={15}  max={50}  unit="°C" onChange={setTemperature}  color="text-orange-400" />
              <SliderRow label="Humidity" value={humidity}     min={10}  max={100} unit="%"  onChange={setHumidity}     color="text-cyan-400" />
              <SliderRow label="Soil Moisture" value={soilMoisture} min={0} max={100} unit="%" onChange={setSoilMoisture} color="text-teal-400" />
            </div>
          </GlassCard>

          {/* Drought probability indicator */}
          {droughtProb !== null && (
            <GlassCard className="!p-5 text-center" hover={false}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Estimated Drought Risk</p>
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full gauge-svg">
                  <circle className="gauge-bg" cx="56" cy="56" r="46" />
                  <circle
                    className="gauge-progress"
                    cx="56" cy="56" r="46"
                    stroke={riskColor}
                    strokeDasharray={`${droughtProb * 289} 289`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold" style={{ color: riskColor }}>
                    {Math.round(droughtProb * 100)}%
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">probability</span>
                </div>
              </div>
              <p className="text-xs font-semibold mt-3" style={{ color: riskColor }}>
                {droughtProb >= 0.65 ? '⚠ High Risk' : droughtProb >= 0.4 ? '⚡ Moderate Risk' : '✓ Low Risk'}
              </p>
            </GlassCard>
          )}

          {/* Top factors */}
          {topFactors.length > 0 && (
            <GlassCard className="!p-5" hover={false}>
              <h3 className="font-bold text-xs mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Top Driving Factors
              </h3>
              <div className="space-y-2">
                {topFactors.map((f, i) => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 font-medium">{FEATURE_LABELS[f] || f}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explanation */}
          <GlassCard className="!p-5" hover={false}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Prediction Explanation
              {loading && <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin ml-auto" />}
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed min-h-[60px]">
              {loading ? (
                <div className="space-y-2">
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-5/6" />
                  <div className="skeleton h-3 w-4/6" />
                </div>
              ) : explanation || 'Adjust parameters to generate AI explanation...'}
            </div>
          </GlassCard>

          {/* Charts grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Local SHAP */}
            <GlassCard className="!p-5" hover={false}>
              <div className="mb-4">
                <h3 className="font-bold text-xs text-slate-200">Local SHAP Contributions</h3>
                <p className="text-[10px] text-slate-500">Red = increases risk · Green = decreases risk</p>
              </div>
              <div className="h-56">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapData} layout="vertical" margin={{ left: 10, right: 15 }}>
                      <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} tickLine={false} width={78} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(10,18,35,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                        formatter={(v) => [v.toFixed(3), 'SHAP']}
                      />
                      <Bar dataKey="val" name="SHAP Value" radius={[0, 4, 4, 0]}>
                        {shapData.map((e, i) => (
                          <Cell key={i} fill={e.val >= 0 ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>

            {/* Global Feature Importance */}
            <GlassCard className="!p-5" hover={false}>
              <div className="mb-4">
                <h3 className="font-bold text-xs text-slate-200">Global Feature Importance</h3>
                <p className="text-[10px] text-slate-500">XGBoost booster weight (%)</p>
              </div>
              <div className="h-56">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={globalImportance} layout="vertical" margin={{ left: 10, right: 15 }}>
                      <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} tickLine={false} width={78} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(10,18,35,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                        formatter={(v) => [`${v}%`, 'Importance']}
                      />
                      <Bar dataKey="importance" name="Weight %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              SHAP values are computed using the <strong className="text-slate-300">TreeExplainer</strong> algorithm on the trained XGBoost model.
              Positive values push toward drought prediction; negative values push away.
              Global importance reflects each feature's average contribution across all training samples.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
