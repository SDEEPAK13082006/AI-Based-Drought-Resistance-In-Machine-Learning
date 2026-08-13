import random
from datetime import datetime, timedelta

REGIONS = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kalahandi', 'Kutch', 'Barmer', 'Jaisalmer']

CROPS_DB = [
    {
        "name": "Pearl Millet (Bajra)",
        "water_requirement": "250-350 mm",
        "growth_period": "75-90 days",
        "expected_yield": "1.5-2.0 tonnes/hectare",
        "profit_estimate": "₹22,000/hectare",
        "drought_resistance": "Excellent",
        "image_emoji": "🌾"
    },
    {
        "name": "Sorghum (Jowar)",
        "water_requirement": "350-450 mm",
        "growth_period": "100-115 days",
        "expected_yield": "2.0-2.5 tonnes/hectare",
        "profit_estimate": "₹26,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🌾"
    },
    {
        "name": "Chickpea (Gram)",
        "water_requirement": "200-300 mm",
        "growth_period": "90-110 days",
        "expected_yield": "1.2-1.8 tonnes/hectare",
        "profit_estimate": "₹35,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🧆"
    },
    {
        "name": "Groundnut",
        "water_requirement": "400-500 mm",
        "growth_period": "105-120 days",
        "expected_yield": "1.8-2.2 tonnes/hectare",
        "profit_estimate": "₹45,000/hectare",
        "drought_resistance": "Moderate-High",
        "image_emoji": "🥜"
    },
    {
        "name": "Sesame (Til)",
        "water_requirement": "250-300 mm",
        "growth_period": "80-95 days",
        "expected_yield": "0.6-0.8 tonnes/hectare",
        "profit_estimate": "₹30,000/hectare",
        "drought_resistance": "Excellent",
        "image_emoji": "🌱"
    },
    {
        "name": "Finger Millet (Ragi)",
        "water_requirement": "300-350 mm",
        "growth_period": "110-120 days",
        "expected_yield": "2.5-3.0 tonnes/hectare",
        "profit_estimate": "₹28,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🌾"
    },
    {
        "name": "Cowpea (Lobia)",
        "water_requirement": "250-350 mm",
        "growth_period": "70-85 days",
        "expected_yield": "1.0-1.5 tonnes/hectare",
        "profit_estimate": "₹24,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🫘"
    },
    {
        "name": "Pigeon Pea (Tur/Arhar)",
        "water_requirement": "500-600 mm",
        "growth_period": "150-180 days",
        "expected_yield": "1.5-2.0 tonnes/hectare",
        "profit_estimate": "₹55,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🫛"
    },
    {
        "name": "Mustard",
        "water_requirement": "250-350 mm",
        "growth_period": "100-115 days",
        "expected_yield": "1.5-2.0 tonnes/hectare",
        "profit_estimate": "₹40,000/hectare",
        "drought_resistance": "Moderate-High",
        "image_emoji": "🌼"
    },
    {
        "name": "Safflower",
        "water_requirement": "200-250 mm",
        "growth_period": "115-130 days",
        "expected_yield": "1.0-1.4 tonnes/hectare",
        "profit_estimate": "₹32,000/hectare",
        "drought_resistance": "Excellent",
        "image_emoji": "🌻"
    },
    {
        "name": "Green Gram (Moong)",
        "water_requirement": "250-300 mm",
        "growth_period": "65-75 days",
        "expected_yield": "0.8-1.2 tonnes/hectare",
        "profit_estimate": "₹28,000/hectare",
        "drought_resistance": "High",
        "image_emoji": "🫘"
    },
    {
        "name": "Cluster Bean (Guar)",
        "water_requirement": "150-250 mm",
        "growth_period": "80-90 days",
        "expected_yield": "1.0-1.2 tonnes/hectare",
        "profit_estimate": "₹20,000/hectare",
        "drought_resistance": "Outstanding",
        "image_emoji": "🌿"
    }
]

STATE_DROUGHT_DATA = {
    "Rajasthan": 0.85,
    "Gujarat": 0.65,
    "Maharashtra": 0.70,
    "Karnataka": 0.60,
    "Andhra Pradesh": 0.55,
    "Telangana": 0.58,
    "Madhya Pradesh": 0.50,
    "Tamil Nadu": 0.48,
    "Uttar Pradesh": 0.42,
    "Bihar": 0.35,
    "Haryana": 0.45,
    "Punjab": 0.30,
    "Chhattisgarh": 0.32,
    "Odisha": 0.40,
    "Jharkhand": 0.45,
    "West Bengal": 0.25,
    "Uttarakhand": 0.20,
    "Himachal Pradesh": 0.18,
    "Jammu and Kashmir": 0.22,
    "Kerala": 0.15,
    "Goa": 0.10,
    "Assam": 0.12,
    "Arunachal Pradesh": 0.08,
    "Manipur": 0.10,
    "Meghalaya": 0.05,
    "Mizoram": 0.08,
    "Nagaland": 0.07,
    "Sikkim": 0.05,
    "Tripura": 0.10,
    "Delhi": 0.50,
    "Puducherry": 0.35,
    "Chandigarh": 0.28,
    "Lakshadweep": 0.15,
    "Andaman and Nicobar": 0.08,
    "Ladakh": 0.75,
    "Dadra and Nagar Haveli and Daman and Diu": 0.40
}

STATE_COORDINATES = {
    "Rajasthan": {"lat": 27.0238, "lng": 74.2179},
    "Gujarat": {"lat": 22.2587, "lng": 71.1924},
    "Maharashtra": {"lat": 19.7515, "lng": 75.7139},
    "Karnataka": {"lat": 15.3173, "lng": 75.7139},
    "Andhra Pradesh": {"lat": 15.9129, "lng": 79.7400},
    "Telangana": {"lat": 18.1124, "lng": 79.0193},
    "Madhya Pradesh": {"lat": 22.9734, "lng": 78.6569},
    "Tamil Nadu": {"lat": 11.1271, "lng": 78.6569},
    "Uttar Pradesh": {"lat": 26.8467, "lng": 80.9462},
    "Bihar": {"lat": 25.0961, "lng": 85.3131},
    "Haryana": {"lat": 29.0588, "lng": 76.0856},
    "Punjab": {"lat": 31.1471, "lng": 75.3412},
    "Chhattisgarh": {"lat": 21.2787, "lng": 81.8661},
    "Odisha": {"lat": 20.9517, "lng": 85.0985},
    "Jharkhand": {"lat": 23.6102, "lng": 85.2799},
    "West Bengal": {"lat": 22.9868, "lng": 87.8550},
    "Uttarakhand": {"lat": 30.0668, "lng": 79.0193},
    "Himachal Pradesh": {"lat": 31.1048, "lng": 77.1734},
    "Jammu and Kashmir": {"lat": 33.7782, "lng": 76.5762},
    "Kerala": {"lat": 10.8505, "lng": 76.2711},
    "Goa": {"lat": 15.2993, "lng": 74.1240},
    "Assam": {"lat": 26.2006, "lng": 92.9376},
    "Arunachal Pradesh": {"lat": 28.2180, "lng": 94.7278},
    "Manipur": {"lat": 24.6637, "lng": 93.9063},
    "Meghalaya": {"lat": 25.4670, "lng": 91.3662},
    "Mizoram": {"lat": 23.1645, "lng": 92.9376},
    "Nagaland": {"lat": 26.1584, "lng": 94.5624},
    "Sikkim": {"lat": 27.5330, "lng": 88.5122},
    "Tripura": {"lat": 23.9408, "lng": 91.9882},
    "Delhi": {"lat": 28.7041, "lng": 77.1025},
    "Puducherry": {"lat": 11.9416, "lng": 79.8083},
    "Chandigarh": {"lat": 30.7333, "lng": 76.7794},
    "Lakshadweep": {"lat": 10.5726, "lng": 72.6417},
    "Andaman and Nicobar": {"lat": 11.7401, "lng": 92.6586},
    "Ladakh": {"lat": 34.1526, "lng": 77.5771},
    "Dadra and Nagar Haveli and Daman and Diu": {"lat": 20.1809, "lng": 73.0169}
}

IRRIGATION_METHODS = {
    "Drip Irrigation": {
        "description": "Slow, precise application of water directly to the plant root zone via a network of valves, pipes, tubing, and emitters. Saves significant water by reducing evaporation and deep percolation.",
        "efficiency": 0.90,
        "suitability": "Best suited for wide-spaced row crops, orchards, and vegetables in arid/drought-prone areas."
    },
    "Sprinkler Irrigation": {
        "description": "Water is piped to one or more central locations within the field and distributed by overhead high-pressure sprinklers or guns, simulating natural rainfall.",
        "efficiency": 0.75,
        "suitability": "Good for sandy soils and uneven landscapes where leveling is not feasible. Best for field crops."
    },
    "Furrow/Surface Irrigation": {
        "description": "Water is introduced into narrow channels or furrows dug along the crop rows. Water flows down the slope under gravity.",
        "efficiency": 0.50,
        "suitability": "Traditional method, suitable for flat lands and clayey soils. High water loss due to runoff and deep percolation."
    }
}

def get_dashboard_stats():
    return {
        "drought_level": random.choice(["Moderate Drought", "Mild Drought", "No Drought", "Severe Drought"]),
        "ai_risk_score": round(random.uniform(0.1, 0.95), 2),
        "todays_rainfall": round(random.uniform(0.0, 15.0), 1),
        "spei": round(random.uniform(-2.5, 1.5), 2),
        "region": random.choice(REGIONS),
        "water_availability": random.choice(["Critical (22%)", "Low (38%)", "Adequate (65%)", "Optimal (85%)"]),
        "crop_recommendation": random.choice([c["name"] for c in CROPS_DB]),
        "model_accuracy": 92.4
    }

def get_rainfall_daily():
    data = []
    base_date = datetime.now() - timedelta(days=30)
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        # Higher rainfall chance in monsoon (June to Sept)
        is_monsoon = current_date.month in [6, 7, 8, 9]
        rain_prob = 0.6 if is_monsoon else 0.1
        rainfall = round(random.uniform(2.0, 45.0), 1) if random.random() < rain_prob else 0.0
        data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "rainfall": rainfall
        })
    return data

def get_rainfall_monthly():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    # Simulated monsoon curve peaking in July-August
    base_rainfall = [5.0, 8.0, 12.0, 20.0, 35.0, 150.0, 280.0, 260.0, 170.0, 60.0, 15.0, 8.0]
    data = []
    for m, r in zip(months, base_rainfall):
        # add some variance
        variance = random.uniform(0.8, 1.2)
        data.append({
            "month": m,
            "rainfall": round(r * variance, 1)
        })
    return data

def get_rainfall_annual():
    data = []
    current_year = datetime.now().year
    # 10 years rainfall
    for i in range(10):
        year = current_year - 9 + i
        # base rainfall around 850mm
        variance = random.uniform(0.7, 1.3)
        data.append({
            "year": str(year),
            "rainfall": round(850 * variance, 1)
        })
    return data

def get_rainfall_comparison():
    data = []
    selected_regions = ['Bundelkhand', 'Vidarbha', 'Marathwada', 'Rayalaseema', 'Kutch']
    # Rainfall averages for these dry regions
    averages = {
        'Bundelkhand': 750,
        'Vidarbha': 950,
        'Marathwada': 680,
        'Rayalaseema': 600,
        'Kutch': 350
    }
    for r in selected_regions:
        data.append({
            "region": r,
            "actual": round(averages[r] * random.uniform(0.8, 1.15), 1),
            "historical_average": averages[r]
        })
    return data

def get_heatmap_data():
    data = []
    for state, severity in STATE_DROUGHT_DATA.items():
        coords = STATE_COORDINATES.get(state, {"lat": 20.0, "lng": 78.0})
        # categorize risk
        if severity >= 0.7:
            risk = "Severe"
        elif severity >= 0.5:
            risk = "High"
        elif severity >= 0.3:
            risk = "Moderate"
        else:
            risk = "Low"
        data.append({
            "state": state,
            "severity": severity,
            "risk_level": risk,
            "lat": coords["lat"],
            "lng": coords["lng"]
        })
    return data
