import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

// Color scale: green → yellow → orange → red
const getSeverityColor = (severity) => {
  if (severity >= 0.75) return { fill: '#ef4444', border: '#dc2626', label: 'Severe' };
  if (severity >= 0.55) return { fill: '#f97316', border: '#ea580c', label: 'High' };
  if (severity >= 0.35) return { fill: '#f59e0b', border: '#d97706', label: 'Moderate' };
  return { fill: '#22c55e', border: '#16a34a', label: 'Low' };
};

const LEGEND_ITEMS = [
  { color: '#22c55e', label: 'Low (< 35%)',      range: '0 – 0.35' },
  { color: '#f59e0b', label: 'Moderate (35–55%)', range: '0.35 – 0.55' },
  { color: '#f97316', label: 'High (55–75%)',     range: '0.55 – 0.75' },
  { color: '#ef4444', label: 'Severe (> 75%)',    range: '> 0.75' },
];

const IndiaHeatMap = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/heatmap/states');
      setStates(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load heatmap data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = {
    severe:   states.filter(s => s.severity >= 0.75).length,
    high:     states.filter(s => s.severity >= 0.55 && s.severity < 0.75).length,
    moderate: states.filter(s => s.severity >= 0.35 && s.severity < 0.55).length,
    low:      states.filter(s => s.severity <  0.35).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Map className="w-8 h-8 text-emerald-500" /> India Drought Severity Map
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time drought severity index across all Indian states and union territories.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stat summary row */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Severe States',   count: stats.severe,   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'High Risk',       count: stats.high,     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Moderate Risk',   count: stats.moderate, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Low / No Drought',count: stats.low,      color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map(({ label, count, color, bg }, i) => (
            <div key={label} className={`glass rounded-xl p-3 border ${bg} text-center`}>
              <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <GlassCard className="!p-0 overflow-hidden" hover={false}>
            {loading ? (
              <div className="h-[520px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-400">Loading map data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-[520px] flex items-center justify-center">
                <div className="text-center p-8">
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={fetchData} className="mt-4 text-xs text-emerald-400 hover:underline">Retry</button>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[22.5, 82.5]}
                zoom={5}
                style={{ height: '520px', width: '100%', borderRadius: '16px' }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution=""
                />
                {states.map((state) => {
                  const { fill, border } = getSeverityColor(state.severity);
                  return (
                    <CircleMarker
                      key={state.state}
                      center={[state.lat, state.lng]}
                      radius={Math.max(10, state.severity * 22)}
                      pathOptions={{
                        fillColor: fill,
                        fillOpacity: 0.75,
                        color: border,
                        weight: 1.5,
                      }}
                      eventHandlers={{ click: () => setSelected(state) }}
                    >
                      <Tooltip direction="top" permanent={false}>
                        <div className="text-xs font-semibold">{state.state}</div>
                        <div className="text-xs text-slate-300">Severity: {Math.round(state.severity * 100)}%</div>
                        <div className="text-xs" style={{ color: fill }}>● {state.risk_level}</div>
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </GlassCard>
        </div>

        {/* Legend + State detail */}
        <div className="space-y-4">
          {/* Legend */}
          <GlassCard className="!p-4" hover={false}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" /> Severity Legend
            </h3>
            <div className="space-y-2.5">
              {LEGEND_ITEMS.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
              Circle size is proportional to drought severity. Click any marker for details.
            </p>
          </GlassCard>

          {/* Selected state detail */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="!p-4" hover={false}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-bold">{selected.state}</h3>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity Score</span>
                    <span className="font-bold" style={{ color: getSeverityColor(selected.severity).fill }}>
                      {Math.round(selected.severity * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level</span>
                    <span className="font-bold" style={{ color: getSeverityColor(selected.severity).fill }}>
                      {selected.risk_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates</span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {selected.lat.toFixed(2)}, {selected.lng.toFixed(2)}
                    </span>
                  </div>
                  {/* Severity bar */}
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${selected.severity * 100}%`,
                          backgroundColor: getSeverityColor(selected.severity).fill
                        }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Top 5 worst states */}
          {!loading && states.length > 0 && (
            <GlassCard className="!p-4" hover={false}>
              <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wide">Top 5 Drought-Hit</h3>
              <div className="space-y-2">
                {[...states]
                  .sort((a, b) => b.severity - a.severity)
                  .slice(0, 5)
                  .map((s, i) => {
                    const { fill } = getSeverityColor(s.severity);
                    return (
                      <div key={s.state} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 w-4 flex-shrink-0">{i + 1}.</span>
                        <span className="flex-1 text-slate-300 truncate">{s.state}</span>
                        <span className="font-bold flex-shrink-0" style={{ color: fill }}>
                          {Math.round(s.severity * 100)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndiaHeatMap;
