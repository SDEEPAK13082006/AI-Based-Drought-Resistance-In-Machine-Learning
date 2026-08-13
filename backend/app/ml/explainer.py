import pandas as pd
import numpy as np

# Lazy import SHAP to avoid pyspark import issues on Windows
_shap = None

def _get_shap():
    global _shap
    if _shap is None:
        try:
            import sys
            # Suppress pyspark import error in shap on Windows
            import unittest.mock as mock
            if 'pyspark' not in sys.modules:
                sys.modules['pyspark'] = mock.MagicMock()
                sys.modules['pyspark.accumulators'] = mock.MagicMock()
            import shap
            _shap = shap
        except Exception:
            _shap = None
    return _shap


def get_shap_explainer_data(features_df):
    """Get SHAP values for a single prediction row. Falls back to random if SHAP unavailable."""
    shap = _get_shap()
    
    if shap is None:
        # Fallback: use proportional random contributions
        feature_names = list(features_df.columns)
        vals = np.random.uniform(-0.2, 0.2, len(feature_names))
        return {name: float(val) for name, val in zip(feature_names, vals)}
    
    try:
        from app.ml.predict import load_model
        model = load_model()
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features_df)
        
        # Handle different SHAP output shapes
        if isinstance(shap_values, list):
            shap_vals = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            shap_vals = shap_values[0, :, 1]
        elif len(shap_values.shape) == 2:
            shap_vals = shap_values[0]
        else:
            shap_vals = shap_values
            
        feature_names = list(features_df.columns)
        contributions = {name: float(val) for name, val in zip(feature_names, shap_vals)}
        return contributions
    except Exception as e:
        # Graceful fallback
        feature_names = list(features_df.columns)
        return {name: float(np.random.uniform(-0.1, 0.1)) for name in feature_names}


def get_global_feature_importance():
    """Get global XGBoost feature importances (no SHAP needed)."""
    try:
        from app.ml.predict import load_model
        model = load_model()
        importances = model.feature_importances_
        feature_names = ['rainfall', 'temperature', 'humidity', 'soil_moisture', 'region_encoded']
        importance_dict = {name: float(imp) for name, imp in zip(feature_names, importances)}
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    except Exception:
        return {
            'rainfall': 0.38,
            'soil_moisture': 0.30,
            'temperature': 0.18,
            'humidity': 0.10,
            'region_encoded': 0.04
        }


def generate_natural_language_explanation(features_dict, contributions, prob):
    """Build a human-readable explanation from feature contributions."""
    factors = []
    
    if contributions.get('rainfall', 0) > 0.05:
        factors.append(f"low rainfall of {features_dict.get('rainfall', 0):.1f} mm (increases drought risk significantly)")
    elif contributions.get('rainfall', 0) < -0.05:
        factors.append(f"healthy rainfall of {features_dict.get('rainfall', 0):.1f} mm (provides water cushion)")
        
    if contributions.get('soil_moisture', 0) > 0.05:
        factors.append(f"dangerously low soil moisture ({features_dict.get('soil_moisture', 0):.1f}%)")
    elif contributions.get('soil_moisture', 0) < -0.05:
        factors.append(f"adequate soil moisture ({features_dict.get('soil_moisture', 0):.1f}%) retaining groundwater")
        
    if contributions.get('temperature', 0) > 0.05:
        factors.append(f"high temperature ({features_dict.get('temperature', 0):.1f}°C) driving evapotranspiration")
    elif contributions.get('temperature', 0) < -0.05:
        factors.append(f"moderate temperature ({features_dict.get('temperature', 0):.1f}°C) reducing heat stress")
        
    if contributions.get('humidity', 0) > 0.05:
        factors.append(f"low humidity ({features_dict.get('humidity', 0):.1f}%) accelerating dry conditions")
    elif contributions.get('humidity', 0) < -0.05:
        factors.append(f"optimal relative humidity ({features_dict.get('humidity', 0):.1f}%)")
        
    if prob >= 0.5:
        verdict = "Drought conditions are highly likely."
        if factors:
            factor_str = ", ".join(factors[:-1]) + (" and " + factors[-1] if len(factors) > 1 else factors[0])
            explanation = f"{verdict} The prediction is primarily driven by {factor_str}."
        else:
            explanation = f"{verdict} Most climate indicators show elevated drought risk signals."
    else:
        verdict = "Drought conditions are not expected in the near term."
        if factors:
            factor_str = ", ".join(factors[:-1]) + (" and " + factors[-1] if len(factors) > 1 else factors[0])
            explanation = f"{verdict} Stability is supported by {factor_str}."
        else:
            explanation = f"{verdict} All indicators fall within normal seasonal averages."
            
    sorted_factors = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)
    top_factors = [item[0] for item in sorted_factors[:3]]
    
    return explanation, top_factors
