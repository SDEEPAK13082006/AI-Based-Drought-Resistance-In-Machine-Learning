import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Calendar, Sparkles, AlertCircle, CheckCircle2, Leaf, Gauge } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const CROPS_LIST = [
  'Pearl Millet (Bajra)', 'Sorghum (Jowar)', 'Chickpea (Gram)', 'Groundnut',
  'Sesame (Til)', 'Finger Millet (Ragi)', 'Cowpea (Lobia)', 'Pigeon Pea (Tur/Arhar)',
  'Mustard', 'Safflower', 'Green Gram (Moong)', 'Cluster Bean (Guar)'
];
const REGIONS_LIST = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer'];

const METHOD_ICONS = {
  'Drip Irrigation':        { emoji: '💧', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  'Sprinkler Irrigation':   { emoji: '🌊', color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  'Furrow/Surface Irrigation': { emoji: '🌾', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

const LabeledSlider = ({ label, value, min, max, unit, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
      <span className="text-slate-400">{label}</span>
      <span className="text-emerald-400">{value} {unit}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full"
    />
    <div className="flex justify-between text-[10px] text-slate-600">
      <span>{min} {unit}</span>
      <span>{max} {unit}</span>
    </div>
  </div>
);

const IrrigationPlanner = () => {
  const [crop, setCrop]               = useState('Pearl Millet (Bajra)');
  const [region, setRegion]           = useState('Bundelkhand');
  const [soilMoisture, setSoilMoisture] = useState(30);
  const [area, setArea]               = useState(1.5);
  const [loading, setLoading]         = useState(false);
  const [plan, setPlan]               = useState(null);
  const [error, setError]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const res = await api.post('/api/irrigation/plan', {
        crop, region,
        soil_moisture: soilMoisture,
        area_hectares: area,
      });
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not generate plan. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const methodMeta = plan ? (METHOD_ICONS[plan.method] || { emoji: '💦', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-400" /> Smart Irrigation Scheduler
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compute optimal crop water requirements and automated irrigation schedules based on live soil metrics.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Panel */}
        <GlassCard className="!p-6 h-fit" hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Field Configuration</h2>
              <p className="text-xs text-slate-400">Set crop, region, area, and current soil moisture</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Crop Variety</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm focus:border-emerald-500/50 transition-all"
                >
                  {CROPS_LIST.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm focus:border-emerald-500/50 transition-all"
                >
                  {REGIONS_LIST.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Farm Area</label>
              <div className="relative">
                <input
                  type="number" step="0.1" min="0.1" max="100"
                  required value={area}
                  onChange={e => setArea(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 pr-20 rounded-xl bg-white/5 border border-white/10 outline-none text-sm focus:border-emerald-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">Hectares</span>
              </div>
            </div>

            <LabeledSlider
              label="Current Soil Moisture"
              value={soilMoisture} min={5} max={90} unit="%"
              onChange={setSoilMoisture}
            />

            {/* Soil moisture visual indicator */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                <span>Wilting Point (5%)</span>
                <span>Field Capacity (90%)</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((soilMoisture - 5) / 85) * 100}%`,
                    background: soilMoisture < 25 ? '#ef4444' : soilMoisture < 50 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                {soilMoisture < 25 ? '🔴 Critical – immediate irrigation needed' : soilMoisture < 50 ? '🟡 Low – schedule irrigation soon' : '✅ Adequate – monitor regularly'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing water demand...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Optimized Plan</>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!plan ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center border border-white/5 border-dashed rounded-2xl p-10 text-center min-h-[400px]"
              >
                <div>
                  <Droplets className="w-14 h-14 text-slate-600 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-300 text-base">Awaiting Field Data</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Configure your crop type, region, and current soil moisture, then click Generate Plan.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {/* Water volume */}
                <GlassCard className="!p-5" hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-shrink-0">
                      <Droplets className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Daily Water Requirement</p>
                      <p className="text-3xl font-extrabold mt-0.5">
                        {plan.water_requirement.toLocaleString()}
                        <span className="text-lg text-blue-400 ml-1">L</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">for {area} ha of {crop}</p>
                    </div>
                  </div>
                </GlassCard>

                {/* Irrigation method */}
                <GlassCard className={`!p-5 border ${methodMeta?.bg}`} hover={false}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{methodMeta?.emoji}</span>
                      <div>
                        <p className={`text-sm font-bold ${methodMeta?.color}`}>{plan.method}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 mt-1 inline-block">
                          {Math.round(plan.efficiency * 100)}% Water Efficient
                        </span>
                      </div>
                    </div>
                    <Gauge className={`w-5 h-5 ${methodMeta?.color} flex-shrink-0`} />
                  </div>
                  {/* Efficiency bar */}
                  <div className="mt-4">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${plan.efficiency * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-3">{plan.method_description}</p>
                </GlassCard>

                {/* Schedule */}
                <GlassCard className="!p-5" hover={false}>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-emerald-500" /> Irrigation Schedule
                  </h3>
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {plan.schedule}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Schedule optimized for {region} climate and {crop} water requirements
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IrrigationPlanner;
