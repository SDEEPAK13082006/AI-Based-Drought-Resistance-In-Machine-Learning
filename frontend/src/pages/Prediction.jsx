import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertCircle, Droplets, Thermometer, Wind, Percent, Calendar } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const Prediction = () => {
  const [region, setRegion] = useState('Bundelkhand');
  const [rainfall, setRainfall] = useState(120);
  const [temperature, setTemperature] = useState(38);
  const [humidity, setHumidity] = useState(30);
  const [soilMoisture, setSoilMoisture] = useState(25);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const regionsList = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer'];

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/predict', {
        region,
        rainfall: floatVal(rainfall),
        temperature: floatVal(temperature),
        humidity: floatVal(humidity),
        soil_moisture: floatVal(soilMoisture)
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Model inference failed. Ensure the server is online and the model is trained.');
    } finally {
      setLoading(false);
    }
  };

  const floatVal = (val) => parseFloat(val);

  const getRiskClass = (level) => {
    if (!level) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    const l = level.toLowerCase();
    if (l.includes('severe')) return 'bg-red-500/10 text-red-500 border-red-500/25';
    if (l.includes('moderate')) return 'bg-amber-500/10 text-amber-500 border-amber-500/25';
    if (l.includes('mild')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25';
  };

  // Helper for Circular Progress Gauge
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (result.drought_probability * circumference) : circumference;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Drought Predictor Portal</h1>
        <p className="text-sm text-slate-400 mt-1">Simulate weather metrics to compute drought probability via XGBoost Classifier.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form panel */}
        <GlassCard className="bg-white/5 border-white/5" hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Climate Parameters</h2>
              <p className="text-xs text-slate-400">Configure parameters for local environment simulation</p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Target Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm transition-all focus:border-emerald-500/50"
              >
                {regionsList.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                ))}
              </select>
            </div>

            {/* Rainfall Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" /> Precipitation (Rainfall)</span>
                <span className="text-blue-400">{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 mm (Severe drought)</span>
                <span>500 mm (Excess water)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-orange-400" /> Air Temperature</span>
                <span className="text-orange-400">{temperature} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15 °C</span>
                <span>50 °C (Critical Heatwave)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-cyan-400" /> Relative Humidity</span>
                <span className="text-cyan-400">{humidity} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Bone dry)</span>
                <span>100% (High moisture)</span>
              </div>
            </div>

            {/* Soil Moisture Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-teal-400" /> Soil Moisture Content</span>
                <span className="text-teal-400">{soilMoisture} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Wilting point)</span>
                <span>100% (Field capacity)</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 text-xs text-red-400 items-start">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Computing XGBoost inference...' : 'Calculate Risk Index'}
            </button>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <div className="flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center border border-white/5 border-dashed rounded-2xl p-8 text-center"
              >
                <div className="max-w-xs">
                  <Brain className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-300">Awaiting Simulation</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure the sliding metrics and click prediction to query the AI model.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="predicted-result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Score gauge Card */}
                <GlassCard className="bg-white/5 border-white/5 p-8 flex flex-col items-center text-center" hover={false}>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Calculated Risk Level</h3>
                  
                  {/* Circle SVG Progress */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full gauge-svg">
                      <circle className="gauge-bg" cx="72" cy="72" r={radius} />
                      <circle 
                        className="gauge-progress" 
                        cx="72" 
                        cy="72" 
                        r={radius}
                        stroke={result.drought_probability >= 0.5 ? '#ef4444' : '#10b981'}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold">{Math.round(result.drought_probability * 100)}%</span>
                      <span className="text-[10px] text-slate-400 uppercase mt-0.5">drought probability</span>
                    </div>
                  </div>

                  <span className={`mt-6 px-4 py-1.5 rounded-full border text-xs font-bold ${getRiskClass(result.risk_level)}`}>
                    {result.risk_level}
                  </span>
                  
                  <div className="w-full mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-white/5 text-xs text-slate-400 font-medium">
                    <div className="flex flex-col items-center">
                      <span>Model Confidence</span>
                      <span className="text-base font-bold text-white mt-1">{result.confidence_score}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span>Target Region</span>
                      <span className="text-base font-bold text-white mt-1">{region}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Explanation Card */}
                <GlassCard className="bg-white/5 border-white/5" hover={false}>
                  <h4 className="font-bold text-sm text-slate-300 mb-2.5">Explainable AI (SHAP Summary)</h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs leading-relaxed text-slate-300">
                    {result.explanation}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500">
                    *Explanation is generated dynamically by evaluating feature contributions against the local SHAP TreeExplainer.
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

export default Prediction;
