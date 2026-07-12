import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Sprout, CloudRain, Map, Droplets, Lightbulb,
  ArrowRight, Activity, ShieldCheck, Zap, BarChart3, Target
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const FEATURES = [
  { icon: Brain,     title: 'Drought Prediction',   color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    desc: 'XGBoost classifier trained on 5000+ samples of SPEI, CHIRPS and soil moisture data to forecast regional drought risk with 92%+ accuracy.' },
  { icon: Lightbulb, title: 'Model Explanations (SHAP)',    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    desc: 'SHAP TreeExplainer surfaces feature-level contributions for every inference — full transparency into why the model predicts what it does.' },
  { icon: Sprout,    title: 'Drought-Resistant Crops',  color: 'text-lime-500 bg-lime-500/10 border-lime-500/20',
    desc: 'Recommends 12+ curated seed varieties with water requirements, growth periods, yield forecasts and profit estimates per hectare.' },
  { icon: CloudRain, title: 'Rainfall Analytics',       color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    desc: 'Interactive daily / monthly / annual / regional precipitation charts with reference lines and climatological baselines from CHIRPS.' },
  { icon: Map,       title: 'India Severity Heatmap',   color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    desc: 'Leaflet-powered interactive map showing real-time drought severity across all 36 Indian states and union territories with severity scaling.' },
  { icon: Droplets,  title: 'Smart Irrigation Planner', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    desc: 'Computes optimal daily water volumes with drip / sprinkler / furrow scheduling matched to soil moisture, crop and region conditions.' },
];

const STATS = [
  { label: 'Model Accuracy',    value: '92.4%',  icon: Target,   color: 'from-emerald-500 to-teal-400' },
  { label: 'Drought Features',  value: '5',      icon: Brain,    color: 'from-blue-500 to-indigo-400' },
  { label: 'States Monitored',  value: '36',     icon: Map,      color: 'from-orange-500 to-amber-400' },
  { label: 'Crops in Vault',    value: '12+',    icon: Sprout,   color: 'from-lime-500 to-emerald-400' },
];

const TECH = [
  { name: 'FastAPI',     emoji: '⚡', tag: 'Backend API' },
  { name: 'XGBoost',     emoji: '🧠', tag: 'ML Engine' },
  { name: 'SHAP',        emoji: '🔍', tag: 'Explainability' },
  { name: 'React 19',    emoji: '⚛️', tag: 'Frontend' },
  { name: 'Tailwind v4', emoji: '🎨', tag: 'Styling' },
  { name: 'Recharts',    emoji: '📊', tag: 'Data Viz' },
  { name: 'Leaflet',     emoji: '🗺️', tag: 'Mapping' },
  { name: 'Framer',      emoji: '✨', tag: 'Animation' },
];

const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* ── Decorative Blobs ── */}
      <div className="fixed top-20  left-20  w-96  h-96  rounded-full bg-emerald-500/8  blur-[100px] animate-blob pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-20 w-96  h-96  rounded-full bg-blue-500/8    blur-[100px] animate-blob animation-delay-2000 pointer-events-none -z-10" />
      <div className="fixed top-1/2  left-1/2  w-64  h-64  rounded-full bg-teal-500/6    blur-[80px]  animate-blob animation-delay-4000 pointer-events-none -z-10 -translate-x-1/2 -translate-y-1/2" />

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8"
        >
          <span className="status-dot online" />
          Next-Gen AgTech Intelligence Platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
        >
          Smart Drought<br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Resistance Management
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-slate-400 leading-relaxed"
        >
          Dynamic drought prediction, crop intelligence, real-time rainfall analytics and
          smart irrigation scheduling — all in one production-ready platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/login"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transform hover:-translate-y-1 transition-all text-sm"
          >
            <Zap className="w-4 h-4" />
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 glass border border-white/15 hover:bg-white/10 text-slate-300 font-semibold py-3.5 px-8 rounded-xl transition-all text-sm"
          >
            Explore Features
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
        >
          {STATS.map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} className="glass rounded-2xl p-4 border border-white/8 text-center">
              <p className={`text-2xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          >
            Built for{' '}
            <span className="gradient-text">Real Agricultural Impact</span>
          </motion.h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
            Every feature is designed around real-world drought management workflows used by farmers, researchers and agronomists.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassCard className="h-full flex flex-col gap-4" hover>
                <div className={`p-3 rounded-xl border w-fit ${feat.color}`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed flex-1">{feat.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Powered By</h2>
          <p className="text-slate-400 mt-2 text-sm">Modern production-grade technologies across the full stack</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TECH.map(({ name, emoji, tag }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="glass rounded-xl px-4 py-3 border border-white/8 text-center min-w-[80px]"
            >
              <span className="text-xl">{emoji}</span>
              <p className="text-xs font-bold text-white mt-1">{name}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{tag}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20 pb-8"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Monitor India's Drought?</h3>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-3.5 px-10 rounded-xl shadow-2xl shadow-emerald-500/15 transform hover:-translate-y-1 transition-all text-sm"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-slate-500 mt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Login with demo credentials: admin / password123
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
