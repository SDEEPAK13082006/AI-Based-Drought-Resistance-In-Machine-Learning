/**
 * mockApi.js
 * --------------------------
 * Client-side mock data layer that mirrors the FastAPI backend.
 * Used automatically when the real backend is unreachable (network error).
 * All data structures match the backend response schemas exactly.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Auth ─────────────────────────────────────────────────────────────────────
const PASSWORD_RE_LETTER  = /[a-zA-Z]/;
const PASSWORD_RE_NUMBER  = /[0-9]/;
const PASSWORD_RE_SPECIAL = /[^a-zA-Z0-9\s]/;

export function mockLogin(username, password) {
  if (!username || !username.trim()) {
    throw new Error('Username cannot be empty.');
  }
  const p = password.trim();
  if (!PASSWORD_RE_LETTER.test(p) || !PASSWORD_RE_NUMBER.test(p) || !PASSWORD_RE_SPECIAL.test(p)) {
    throw new Error('Password must contain a combination of letters, numbers, and special characters (e.g. @, #, $).');
  }
  // Issue a simple base64 "token" — enough to satisfy localStorage checks
  const payload = btoa(JSON.stringify({ sub: username.trim(), exp: Date.now() + 86400000 }));
  return { access_token: `mock.${payload}.sig`, token_type: 'bearer', username: username.trim() };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
const REGIONS = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer'];
const CROP_NAMES = [
  'Pearl Millet (Bajra)', 'Sorghum (Jowar)', 'Chickpea (Gram)', 'Sesame (Til)',
  'Cowpea (Lobia)', 'Cluster Bean (Guar)', 'Safflower', 'Green Gram (Moong)',
];

export function getDashboardStats() {
  const spei = parseFloat((Math.random() * 4 - 2.5).toFixed(2));
  let drought_level, ai_risk_score, water_availability;
  if (spei <= -2.0) {
    drought_level = 'Extreme Drought'; ai_risk_score = parseFloat((0.9 + (Math.abs(spei) - 2) * 0.05).toFixed(2));
    water_availability = 'Critical (18%)';
  } else if (spei <= -1.5) {
    drought_level = 'Severe Drought'; ai_risk_score = parseFloat((0.75 + (Math.abs(spei) - 1.5) * 0.15).toFixed(2));
    water_availability = 'Critical (22%)';
  } else if (spei <= -1.0) {
    drought_level = 'Moderate Drought'; ai_risk_score = parseFloat((0.50 + (Math.abs(spei) - 1.0) * 0.25).toFixed(2));
    water_availability = 'Low (35%)';
  } else if (spei <= -0.5) {
    drought_level = 'Mild Drought'; ai_risk_score = parseFloat((0.25 + (Math.abs(spei) - 0.5) * 0.25).toFixed(2));
    water_availability = 'Low (42%)';
  } else {
    drought_level = 'No Drought'; ai_risk_score = parseFloat(Math.max(0.05, 0.20 - spei * 0.08).toFixed(2));
    water_availability = 'Adequate (65%)';
  }
  return {
    drought_level,
    ai_risk_score: Math.min(0.99, ai_risk_score),
    todays_rainfall: rand(0, 18),
    spei,
    region: pick(REGIONS),
    water_availability,
    crop_recommendation: pick(CROP_NAMES),
    model_accuracy: 92.4,
  };
}

// ─── Rainfall ────────────────────────────────────────────────────────────────
export function getRainfallDaily() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isMonsoon = [6, 7, 8, 9].includes(d.getMonth() + 1);
    const rainfall = Math.random() < (isMonsoon ? 0.6 : 0.15) ? rand(1.5, 48) : 0;
    data.push({ date: d.toISOString().slice(0, 10), rainfall });
  }
  return data;
}

export function getRainfallMonthly() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const base   = [5, 8, 12, 22, 38, 155, 285, 265, 175, 62, 16, 9];
  return months.map((month, i) => ({ month, rainfall: rand(base[i] * 0.8, base[i] * 1.2) }));
}

export function getRainfallAnnual() {
  const year = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => ({
    year: String(year - 9 + i),
    rainfall: rand(600, 1100),
  }));
}

export function getRainfallComparison() {
  const regions = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kutch'];
  const avg     = { Bundelkhand: 750, Vidarbha: 950, Marathwada: 680, Rayalaseema: 600, Kutch: 350 };
  return regions.map(region => ({
    region,
    actual: rand(avg[region] * 0.78, avg[region] * 1.15),
    historical_average: avg[region],
  }));
}

// ─── Crops ───────────────────────────────────────────────────────────────────
export const CROPS_DB = [
  { name: 'Pearl Millet (Bajra)',   water_requirement: '250-350 mm', growth_period: '75-90 days',   expected_yield: '1.5-2.0 tonnes/hectare', profit_estimate: '₹22,000/hectare', drought_resistance: 'Excellent',    image_emoji: '🌾' },
  { name: 'Sorghum (Jowar)',        water_requirement: '350-450 mm', growth_period: '100-115 days', expected_yield: '2.0-2.5 tonnes/hectare', profit_estimate: '₹26,000/hectare', drought_resistance: 'High',         image_emoji: '🌾' },
  { name: 'Chickpea (Gram)',        water_requirement: '200-300 mm', growth_period: '90-110 days',  expected_yield: '1.2-1.8 tonnes/hectare', profit_estimate: '₹35,000/hectare', drought_resistance: 'High',         image_emoji: '🧆' },
  { name: 'Groundnut',              water_requirement: '400-500 mm', growth_period: '105-120 days', expected_yield: '1.8-2.2 tonnes/hectare', profit_estimate: '₹45,000/hectare', drought_resistance: 'Moderate-High', image_emoji: '🥜' },
  { name: 'Sesame (Til)',           water_requirement: '250-300 mm', growth_period: '80-95 days',   expected_yield: '0.6-0.8 tonnes/hectare', profit_estimate: '₹30,000/hectare', drought_resistance: 'Excellent',    image_emoji: '🌱' },
  { name: 'Finger Millet (Ragi)',   water_requirement: '300-350 mm', growth_period: '110-120 days', expected_yield: '2.5-3.0 tonnes/hectare', profit_estimate: '₹28,000/hectare', drought_resistance: 'High',         image_emoji: '🌾' },
  { name: 'Cowpea (Lobia)',         water_requirement: '250-350 mm', growth_period: '70-85 days',   expected_yield: '1.0-1.5 tonnes/hectare', profit_estimate: '₹24,000/hectare', drought_resistance: 'High',         image_emoji: '🫘' },
  { name: 'Pigeon Pea (Tur/Arhar)', water_requirement: '500-600 mm', growth_period: '150-180 days', expected_yield: '1.5-2.0 tonnes/hectare', profit_estimate: '₹55,000/hectare', drought_resistance: 'High',         image_emoji: '🫛' },
  { name: 'Mustard',                water_requirement: '250-350 mm', growth_period: '100-115 days', expected_yield: '1.5-2.0 tonnes/hectare', profit_estimate: '₹40,000/hectare', drought_resistance: 'Moderate-High', image_emoji: '🌼' },
  { name: 'Safflower',              water_requirement: '200-250 mm', growth_period: '115-130 days', expected_yield: '1.0-1.4 tonnes/hectare', profit_estimate: '₹32,000/hectare', drought_resistance: 'Excellent',    image_emoji: '🌻' },
  { name: 'Green Gram (Moong)',     water_requirement: '250-300 mm', growth_period: '65-75 days',   expected_yield: '0.8-1.2 tonnes/hectare', profit_estimate: '₹28,000/hectare', drought_resistance: 'High',         image_emoji: '🫘' },
  { name: 'Cluster Bean (Guar)',    water_requirement: '150-250 mm', growth_period: '80-90 days',   expected_yield: '1.0-1.2 tonnes/hectare', profit_estimate: '₹20,000/hectare', drought_resistance: 'Outstanding',  image_emoji: '🌿' },
];

export function getCrops(region) {
  let crops = [...CROPS_DB];
  if (region) {
    const r = region.toLowerCase();
    if (r.includes('kutch') || r.includes('barmer') || r.includes('jaisalmer')) {
      crops.sort((a, b) =>
        ['Outstanding', 'Excellent'].includes(b.drought_resistance) ? 1 : -1
      );
    } else if (r.includes('bundelkhand')) {
      const pref = ['Pearl Millet (Bajra)', 'Chickpea (Gram)', 'Mustard'];
      crops.sort((a, b) => pref.includes(b.name) ? 1 : -1);
    }
  }
  return crops;
}

export function getAllCrops() { return CROPS_DB; }

// ─── Prediction ───────────────────────────────────────────────────────────────
export function predictDrought({ rainfall, temperature, humidity, soil_moisture, region }) {
  // Deterministic-ish formula based on inputs
  const rain_factor    = Math.max(0, (300 - rainfall) / 300);
  const temp_factor    = Math.max(0, (temperature - 25) / 25);
  const humid_factor   = Math.max(0, (50 - humidity) / 50);
  const soil_factor    = Math.max(0, (40 - soil_moisture) / 40);
  const raw_prob = (rain_factor * 0.40 + temp_factor * 0.25 + humid_factor * 0.20 + soil_factor * 0.15);
  const drought_probability = Math.min(0.99, Math.max(0.01, raw_prob + (Math.random() - 0.5) * 0.08));

  let risk_level;
  if (drought_probability >= 0.7)      risk_level = 'Severe Drought Risk';
  else if (drought_probability >= 0.5) risk_level = 'Moderate Drought Risk';
  else if (drought_probability >= 0.3) risk_level = 'Mild Drought Risk';
  else                                  risk_level = 'No Drought Risk';

  const explanation = `For ${region}: rainfall of ${rainfall}mm (${rainfall < 200 ? 'critically low — major drought driver' : rainfall < 350 ? 'below normal — contributing to stress' : 'adequate'}), temperature ${temperature}°C (${temperature > 38 ? 'high evapotranspiration loss' : 'within normal range'}), humidity ${humidity}% (${humidity < 35 ? 'very dry atmosphere' : 'moderate'}), soil moisture ${soil_moisture}% (${soil_moisture < 25 ? 'approaching wilting point — urgent' : soil_moisture < 45 ? 'below field capacity' : 'adequate'}). Overall drought probability: ${Math.round(drought_probability * 100)}%.`;

  return {
    drought_probability: parseFloat(drought_probability.toFixed(3)),
    risk_level,
    confidence_score: randInt(85, 96),
    explanation,
  };
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
const STATE_DATA = {
  Rajasthan: { severity: 0.85, lat: 27.02, lng: 74.22 }, Gujarat: { severity: 0.65, lat: 22.26, lng: 71.19 },
  Maharashtra: { severity: 0.70, lat: 19.75, lng: 75.71 }, Karnataka: { severity: 0.60, lat: 15.32, lng: 75.71 },
  'Andhra Pradesh': { severity: 0.55, lat: 15.91, lng: 79.74 }, Telangana: { severity: 0.58, lat: 18.11, lng: 79.02 },
  'Madhya Pradesh': { severity: 0.50, lat: 22.97, lng: 78.66 }, 'Tamil Nadu': { severity: 0.48, lat: 11.13, lng: 78.66 },
  'Uttar Pradesh': { severity: 0.42, lat: 26.85, lng: 80.95 }, Bihar: { severity: 0.35, lat: 25.10, lng: 85.31 },
  Haryana: { severity: 0.45, lat: 29.06, lng: 76.09 }, Punjab: { severity: 0.30, lat: 31.15, lng: 75.34 },
  Chhattisgarh: { severity: 0.32, lat: 21.28, lng: 81.87 }, Odisha: { severity: 0.40, lat: 20.95, lng: 85.10 },
  Jharkhand: { severity: 0.45, lat: 23.61, lng: 85.28 }, 'West Bengal': { severity: 0.25, lat: 22.99, lng: 87.86 },
  Uttarakhand: { severity: 0.20, lat: 30.07, lng: 79.02 }, 'Himachal Pradesh': { severity: 0.18, lat: 31.10, lng: 77.17 },
  'Jammu and Kashmir': { severity: 0.22, lat: 33.78, lng: 76.58 }, Kerala: { severity: 0.15, lat: 10.85, lng: 76.27 },
  Goa: { severity: 0.10, lat: 15.30, lng: 74.12 }, Assam: { severity: 0.12, lat: 26.20, lng: 92.94 },
  'Arunachal Pradesh': { severity: 0.08, lat: 28.22, lng: 94.73 }, Manipur: { severity: 0.10, lat: 24.66, lng: 93.91 },
  Meghalaya: { severity: 0.05, lat: 25.47, lng: 91.37 }, Mizoram: { severity: 0.08, lat: 23.16, lng: 92.94 },
  Nagaland: { severity: 0.07, lat: 26.16, lng: 94.56 }, Sikkim: { severity: 0.05, lat: 27.53, lng: 88.51 },
  Tripura: { severity: 0.10, lat: 23.94, lng: 91.99 }, Delhi: { severity: 0.50, lat: 28.70, lng: 77.10 },
  Puducherry: { severity: 0.35, lat: 11.94, lng: 79.81 }, Ladakh: { severity: 0.75, lat: 34.15, lng: 77.58 },
};

export function getHeatmapData() {
  return Object.entries(STATE_DATA).map(([state, d]) => {
    const s = d.severity;
    const risk_level = s >= 0.75 ? 'Severe' : s >= 0.55 ? 'High' : s >= 0.35 ? 'Moderate' : 'Low';
    return { state, severity: s, risk_level, lat: d.lat, lng: d.lng };
  });
}

// ─── Irrigation ───────────────────────────────────────────────────────────────
const CROP_WATER = {
  'Pearl Millet (Bajra)': 300, 'Sorghum (Jowar)': 400, 'Chickpea (Gram)': 250,
  Groundnut: 450, 'Sesame (Til)': 275, 'Finger Millet (Ragi)': 325,
  'Cowpea (Lobia)': 300, 'Pigeon Pea (Tur/Arhar)': 550, Mustard: 300,
  Safflower: 225, 'Green Gram (Moong)': 275, 'Cluster Bean (Guar)': 200,
};

const METHODS = {
  'Drip Irrigation':           { efficiency: 0.90, description: 'Slow, precise application of water directly to the plant root zone via a network of valves, pipes, tubing, and emitters. Saves significant water by reducing evaporation and deep percolation.' },
  'Sprinkler Irrigation':      { efficiency: 0.75, description: 'Water is piped to one or more central locations and distributed by overhead high-pressure sprinklers, simulating natural rainfall. Good for sandy soils and uneven landscapes.' },
  'Furrow/Surface Irrigation': { efficiency: 0.50, description: 'Water is introduced into narrow channels or furrows dug along crop rows. Water flows by gravity. Traditional method suited for flat land and clay soils.' },
};

export function generateIrrigationPlan({ crop, region, soil_moisture, area_hectares }) {
  const baseWater = CROP_WATER[crop] || 300;
  const deficit   = Math.max(0, (50 - soil_moisture) / 50);
  const rawReq    = baseWater * deficit * area_hectares * 10; // litres

  // Pick method based on soil moisture
  let method;
  if (soil_moisture < 30) method = 'Drip Irrigation';
  else if (soil_moisture < 55) method = 'Sprinkler Irrigation';
  else method = 'Furrow/Surface Irrigation';

  const { efficiency, description } = METHODS[method];
  const water_requirement = Math.round(rawReq / efficiency);

  const freqDays = soil_moisture < 30 ? 2 : soil_moisture < 50 ? 3 : 5;
  const schedule = `Week 1–2: Irrigate every ${freqDays} days, ${Math.round(water_requirement / (7 / freqDays)).toLocaleString()} L/session.\nWeek 3–4: Reassess soil moisture; irrigate every ${freqDays + 1} days if SPEI > -1.0.\nMonsoon onset: Suspend irrigation; monitor cumulative rainfall vs ${baseWater}mm crop demand.\nPost-monsoon: Resume ${method.toLowerCase()} at 60% rate to prevent waterlogging.\n\nNote: Adjust schedule based on actual soil moisture readings every 48 h.`;

  return { method, efficiency, method_description: description, water_requirement, schedule };
}

// ─── AI Insights / SHAP ───────────────────────────────────────────────────────
export function getInsights({ rainfall, temperature, humidity, soil_moisture, region }) {
  const rain_shap  = parseFloat(((300 - rainfall) / 300 * 0.8 - 0.3).toFixed(3));
  const temp_shap  = parseFloat(((temperature - 30) / 20 * 0.5).toFixed(3));
  const humid_shap = parseFloat(((40 - humidity) / 60 * 0.4).toFixed(3));
  const soil_shap  = parseFloat(((35 - soil_moisture) / 70 * 0.35).toFixed(3));
  const reg_shap   = parseFloat((Math.random() * 0.2 - 0.1).toFixed(3));

  const shap_values = { rainfall: rain_shap, temperature: temp_shap, humidity: humid_shap, soil_moisture: soil_shap, region: reg_shap };
  const feature_importance = { rainfall: 0.38, temperature: 0.24, humidity: 0.18, soil_moisture: 0.14, region: 0.06 };

  const shapEntries = Object.entries(shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const top_factors = shapEntries.map(([k]) => k);

  const prob = Math.min(0.99, Math.max(0.01, 0.5 + Object.values(shap_values).reduce((s, v) => s + v, 0) * 0.15));
  const explanation = `For ${region}: rainfall of ${rainfall}mm ${rain_shap > 0.1 ? 'is significantly below normal — the primary drought driver (SHAP: +' + rain_shap + ')' : 'is near normal (SHAP: ' + rain_shap + ')'}. Temperature at ${temperature}°C ${temp_shap > 0.1 ? 'increases evapotranspiration stress' : 'is within manageable range'}. Soil moisture at ${soil_moisture}% ${soil_shap > 0.05 ? 'is critically low — needs immediate irrigation' : 'is adequate for current crop stage'}. Estimated drought risk: ${Math.round(prob * 100)}%.`;

  return { feature_importance, shap_values, explanation, top_factors };
}

// ─── MLOps ────────────────────────────────────────────────────────────────────
export function getMLOpsStatus() {
  return {
    model_version: 'v2.1.4-xgb',
    training_date: '2026-07-10 14:32:00',
    dataset_version: 'DS_CHIRPS_SPEI_V2.0',
    data_drift_status: 'No Drift Detected (PSI = 0.08)',
    prediction_accuracy: 92.4,
    total_predictions: 14208,
    model_type: 'XGBoost Classifier',
    features_used: ['rainfall', 'temperature', 'humidity', 'soil_moisture', 'region_encoded'],
  };
}

export function getMLOpsMetrics() {
  const base_accuracy = [91.2, 91.5, 91.8, 92.0, 92.2, 92.3, 92.4];
  const drift_scores  = [0.03, 0.04, 0.05, 0.06, 0.07, 0.07, 0.08];
  const latencies     = [12.4, 11.8, 12.1, 10.9, 11.2, 10.5, 11.1];
  return Array.from({ length: 7 }, (_, i) => ({
    timestamp:  `Day -${6 - i}`,
    accuracy:   base_accuracy[i],
    drift_score: drift_scores[i],
    latency_ms: latencies[i],
  }));
}
