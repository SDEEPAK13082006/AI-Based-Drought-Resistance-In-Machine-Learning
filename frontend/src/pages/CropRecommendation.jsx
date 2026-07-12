import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Search, Filter, RefreshCw, Droplet, Clock, IndianRupee, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../utils/api';

const resistanceMeta = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'outstanding') return { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
  if (l === 'excellent')   return { cls: 'bg-teal-500/15 text-teal-400 border-teal-500/30',         dot: 'bg-teal-400' };
  if (l === 'high')        return { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',          dot: 'bg-blue-400' };
  return                          { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',        dot: 'bg-slate-400' };
};

const CropCard = ({ crop, index }) => {
  const meta = resistanceMeta(crop.drought_resistance);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="glass glass-hover rounded-2xl p-5 flex flex-col justify-between h-full border border-white/5 group"
    >
      {/* Top */}
      <div>
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2.5 rounded-xl bg-white/5 border border-white/8 group-hover:scale-110 transition-transform">
              {crop.image_emoji}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">{crop.name}</h3>
              <span className={`inline-flex items-center gap-1.5 border text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${meta.cls}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {crop.drought_resistance}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Droplet className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="flex-1">Water Demand</span>
            <span className="font-semibold text-white">{crop.water_requirement}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="flex-1">Growth Period</span>
            <span className="font-semibold text-white">{crop.growth_period}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="flex-1">Expected Yield</span>
            <span className="font-semibold text-white">{crop.expected_yield}</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Profit Estimate</span>
        <span className="font-extrabold text-emerald-400 flex items-center gap-0.5 text-sm">
          <IndianRupee className="w-3.5 h-3.5" />
          {crop.profit_estimate.replace('₹', '')}
        </span>
      </div>
    </motion.div>
  );
};

const CropRecommendation = () => {
  const [crops, setCrops]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');

  const regions = ['All', 'Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer'];

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const url = regionFilter !== 'All' ? `/api/crops?region=${regionFilter}` : '/api/crops/all';
      const res = await api.get(url);
      setCrops(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch crop data. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [regionFilter]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const filtered = crops.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Sprout className="w-8 h-8 text-emerald-500" /> Drought-Resistant Seed Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated drought-resistant varieties matched to regional water availability and soil conditions.
          </p>
        </div>
        <button
          onClick={fetchCrops}
          disabled={loading}
          className="p-2.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 self-start"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search crops..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex flex-wrap gap-2">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  regionFilter === r
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {!loading && !error && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-white">{filtered.length}</span> varieties shown
          {searchQuery && <span>for "<span className="text-emerald-400">{searchQuery}</span>"</span>}
          {regionFilter !== 'All' && <span>in <span className="text-blue-400">{regionFilter}</span></span>}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-52">
              <div className="skeleton h-4 w-3/4 mb-3" />
              <div className="skeleton h-3 w-1/2 mb-6" />
              <div className="space-y-2">
                <div className="skeleton h-2.5 w-full" />
                <div className="skeleton h-2.5 w-5/6" />
                <div className="skeleton h-2.5 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchCrops} className="text-xs text-emerald-400 hover:underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <Sprout className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No crops match your search.</p>
          <button onClick={() => setSearchQuery('')} className="text-xs text-emerald-400 hover:underline mt-2 block mx-auto">Clear search</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filtered.map((crop, i) => <CropCard key={crop.name} crop={crop} index={i} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
