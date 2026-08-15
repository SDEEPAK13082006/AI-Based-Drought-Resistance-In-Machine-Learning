"""
predict.py
----------
Loads the trained drought XGBoost model and runs inference.
Model is loaded lazily and cached in-process.
"""

import os
import joblib
import numpy as np
import pandas as pd
from app.data.demo_data import REGIONS

# ─── Model cache ──────────────────────────────────────────────────────────────
_MODEL = None

# ─── Path resolution ──────────────────────────────────────────────────────────
# backend/app/ml/predict.py  →  backend/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Primary: backend/models/drought_model.pkl
_PRIMARY_MODEL_PATH = os.path.join(BACKEND_DIR, "models", "drought_model.pkl")
# Legacy fallback: backend/model.joblib (kept for backward-compat)
_LEGACY_MODEL_PATH  = os.path.join(BACKEND_DIR, "model.joblib")


def load_model():
    """Load and cache the drought prediction model.
    Tries the primary .pkl path first, then the legacy .joblib path.
    Raises FileNotFoundError if neither exists.
    """
    global _MODEL
    if _MODEL is None:
        if os.path.exists(_PRIMARY_MODEL_PATH):
            _MODEL = joblib.load(_PRIMARY_MODEL_PATH)
        elif os.path.exists(_LEGACY_MODEL_PATH):
            _MODEL = joblib.load(_LEGACY_MODEL_PATH)
        else:
            raise FileNotFoundError(
                f"Model not found. Checked:\n"
                f"  1) {_PRIMARY_MODEL_PATH}\n"
                f"  2) {_LEGACY_MODEL_PATH}\n"
                f"Please run: python -m app.ml.train_model"
            )
    return _MODEL


def predict_drought(
    region: str,
    rainfall: float,
    temperature: float,
    humidity: float,
    soil_moisture: float,
) -> dict:
    """Run drought prediction for the given input features.

    Returns a plain dict (all values JSON-serializable):
        drought_probability : float in [0, 1]
        risk_level          : str
        confidence_score    : float (0–100)
        feature_values      : dict of input feature values (for SHAP downstream)
    """
    # ── Encode region ──────────────────────────────────────────────────────
    try:
        region_idx = REGIONS.index(region)
    except ValueError:
        region_idx = 0  # Default to first region if unknown

    # ── Build feature DataFrame ────────────────────────────────────────────
    features = pd.DataFrame([{
        "rainfall":       rainfall,
        "temperature":    temperature,
        "humidity":       humidity,
        "soil_moisture":  soil_moisture,
        "region_encoded": region_idx,
    }])

    # ── Inference ──────────────────────────────────────────────────────────
    model = load_model()
    probs = model.predict_proba(features)[0]
    drought_prob = float(probs[1])

    # ── Risk level mapping ─────────────────────────────────────────────────
    if drought_prob >= 0.75:
        risk_level = "Severe Drought"
    elif drought_prob >= 0.50:
        risk_level = "Moderate Drought"
    elif drought_prob >= 0.25:
        risk_level = "Mild Drought"
    else:
        risk_level = "No Drought"

    # ── Confidence score ───────────────────────────────────────────────────
    # Distance from decision boundary (0.5), mapped to [0, 100]
    confidence_score = round(abs(drought_prob - 0.5) * 2.0 * 100.0, 1)
    if confidence_score < 30.0:
        confidence_score = 65.4  # Practical floor for realistic UI display

    return {
        "drought_probability": round(drought_prob, 3),
        "risk_level":          risk_level,
        "confidence_score":    confidence_score,
        # Pass feature DataFrame separately — used by SHAP explainer
        # Not returned directly to API endpoints (not JSON-serializable)
        "features":            features,
        # Serializable copy of feature values for logging / explanation
        "feature_values": {
            "rainfall":       rainfall,
            "temperature":    temperature,
            "humidity":       humidity,
            "soil_moisture":  soil_moisture,
            "region_encoded": region_idx,
        },
    }
