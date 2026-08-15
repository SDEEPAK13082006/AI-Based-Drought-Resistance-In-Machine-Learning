"""
train_model.py
--------------
Trains and saves all ML models for the Drought Resistance project.
Outputs (all saved to backend/models/):
  - drought_model.pkl    : XGBoost classifier for drought prediction
  - scaler.pkl           : StandardScaler fitted on drought training features
  - fertilizer_model.pkl : RandomForest classifier for fertilizer recommendation
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# Force UTF-8 output on Windows so special chars don't crash
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ---- Path Setup --------------------------------------------------------------
# backend/app/ml/train_model.py  ->  backend/
BACKEND_DIR  = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Project root (one level above backend/)
PROJECT_DIR  = os.path.dirname(BACKEND_DIR)
MODELS_DIR   = os.path.join(BACKEND_DIR, "models")
DATASETS_DIR = os.path.join(PROJECT_DIR, "Datasets")

os.makedirs(MODELS_DIR, exist_ok=True)


# ==============================================================================
# 1. DROUGHT PREDICTION MODEL  (XGBoost)
# ==============================================================================
def train_drought_model():
    print("\n" + "=" * 60)
    print("  TRAINING: Drought Prediction Model (XGBoost)")
    print("=" * 60)

    np.random.seed(42)
    n_samples = 8000

    # Generate realistic synthetic features
    # Rainfall (mm): 10-500 for drought-prone regions of India
    rainfall       = np.random.uniform(10.0, 500.0, n_samples)
    # Temperature (C): 15-48
    temperature    = np.random.uniform(15.0, 48.0, n_samples)
    # Humidity (%): 10-95
    humidity       = np.random.uniform(10.0, 95.0, n_samples)
    # Soil Moisture (%): 5-90
    soil_moisture  = np.random.uniform(5.0, 90.0, n_samples)
    # Region index (0-7 for 8 drought-prone regions)
    region_encoded = np.random.randint(0, 8, n_samples)

    df = pd.DataFrame({
        "rainfall":       rainfall,
        "temperature":    temperature,
        "humidity":       humidity,
        "soil_moisture":  soil_moisture,
        "region_encoded": region_encoded,
    })

    # Define drought label using a physics-inspired scoring index
    # Components contributing to drought:
    #   - Low rainfall       -> high score
    #   - High temperature   -> high score
    #   - Low humidity       -> high score
    #   - Low soil moisture  -> high score
    score = (
        (500.0 - df["rainfall"])      / 500.0 * 2.0  +   # weight 2.0
        (df["temperature"] - 15.0)    / 33.0  * 1.5  +   # weight 1.5
        (100.0 - df["humidity"])      / 100.0 * 1.0  +   # weight 1.0
        (100.0 - df["soil_moisture"]) / 100.0 * 2.5        # weight 2.5
    )

    # Score range ~0-7. Sigmoid centred at 4.2 creates ~40% drought prevalence.
    drought_prob_base = 1.0 / (1.0 + np.exp(-3.0 * (score - 4.2)))

    # Add stochastic noise to avoid perfectly deterministic labels
    noise = np.random.uniform(0.0, 1.0, n_samples)
    df["drought"] = (drought_prob_base > noise).astype(int)

    print(f"Dataset generated: {n_samples} samples")
    print(f"Drought class distribution:\n{df['drought'].value_counts(normalize=True).round(3)}")

    # Train / test split
    X = df.drop(columns=["drought"])
    y = df["drought"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Fit & save StandardScaler
    scaler = StandardScaler()
    scaler.fit(X_train)   # fit only on train; transform used in future pipeline

    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"[OK] Scaler saved -> {scaler_path}")

    # Train XGBoost Classifier on raw features (tree-based, no scaling needed)
    print("\nTraining XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.05,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="logloss",
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # Evaluate
    y_pred   = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy : {accuracy * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Drought", "Drought"]))

    # Save primary .pkl
    model_path = os.path.join(MODELS_DIR, "drought_model.pkl")
    joblib.dump(model, model_path)
    print(f"[OK] Drought model saved -> {model_path}")

    # Save legacy copy at backend/ root for backward compatibility
    legacy_path = os.path.join(BACKEND_DIR, "model.joblib")
    joblib.dump(model, legacy_path)
    print(f"[OK] Legacy model copy   -> {legacy_path}")

    return model, scaler


# ==============================================================================
# 2. FERTILIZER RECOMMENDATION MODEL  (RandomForest)
# ==============================================================================
def train_fertilizer_model():
    print("\n" + "=" * 60)
    print("  TRAINING: Fertilizer Recommendation Model (RandomForest)")
    print("=" * 60)

    fertilizer_csv = os.path.join(DATASETS_DIR, "Fertilizer Prediction.csv")
    df = None

    if os.path.exists(fertilizer_csv):
        print(f"Loading real dataset: {fertilizer_csv}")
        df = pd.read_csv(fertilizer_csv)
        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")

        # Identify target column
        # Common columns in Fertilizer Prediction.csv:
        #   Temparature, Humidity, Moisture, Soil Type, Crop Type,
        #   Nitrogen, Potassium, Phosphorous, Fertilizer Name
        target_col = next(
            (c for c in df.columns if "fertilizer" in c.lower()),
            None
        )
        if target_col is None:
            print("  [WARN] Could not identify fertilizer target column. Falling back to synthetic data.")
            df = None
    else:
        print(f"  [WARN] Dataset not found at {fertilizer_csv}. Generating synthetic data.")

    if df is not None:
        # Encode categorical columns
        le_dict = {}
        for col in df.select_dtypes(include="object").columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            le_dict[col] = le

        feature_cols = [c for c in df.columns if c != target_col]
        X = df[feature_cols]
        y = df[target_col]

        print(f"Features : {feature_cols}")
        print(f"Target   : {target_col}  ({y.nunique()} classes)")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42,
            stratify=y if y.nunique() < 50 else None
        )
    else:
        # Synthetic fertilizer dataset
        np.random.seed(42)
        n = 3000
        temperature = np.random.uniform(10, 45, n)
        humidity    = np.random.uniform(20, 90, n)
        moisture    = np.random.uniform(10, 80, n)
        soil_type   = np.random.randint(0, 5, n)    # 5 soil types
        crop_type   = np.random.randint(0, 10, n)   # 10 crop types
        nitrogen    = np.random.uniform(0, 140, n)
        potassium   = np.random.uniform(0, 205, n)
        phosphorous = np.random.uniform(0, 145, n)

        # Rule-based labelling (0-6 fertilizer types)
        labels = np.zeros(n, dtype=int)
        labels[(nitrogen < 50) & (phosphorous < 50)]  = 1  # DAP
        labels[(nitrogen < 50) & (potassium  > 150)]  = 2  # MOP
        labels[(nitrogen > 100)]                       = 3  # Urea
        labels[(humidity > 70) & (temperature < 25)]  = 4  # Compost
        labels[(moisture < 30) & (soil_type == 0)]    = 5  # Super-phosphate
        labels[(crop_type > 7)]                        = 6  # 10-26-26

        X = pd.DataFrame({
            "temperature": temperature, "humidity": humidity,
            "moisture":    moisture,    "soil_type": soil_type,
            "crop_type":   crop_type,   "nitrogen":  nitrogen,
            "potassium":   potassium,   "phosphorous": phosphorous,
        })
        y = pd.Series(labels, name="fertilizer")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

    # Train RandomForest
    print("\nTraining RandomForest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(X_train, y_train)

    y_pred   = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy : {accuracy * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    fertilizer_path = os.path.join(MODELS_DIR, "fertilizer_model.pkl")
    joblib.dump(rf_model, fertilizer_path)
    print(f"[OK] Fertilizer model saved -> {fertilizer_path}")

    return rf_model


# ==============================================================================
# MAIN
# ==============================================================================
def main():
    print("\n" + "#" * 60)
    print("  AI DROUGHT RESISTANCE -- ML Training Pipeline")
    print("#" * 60)
    print(f"\nModels directory  : {MODELS_DIR}")
    print(f"Datasets directory: {DATASETS_DIR}")

    # 1. Drought prediction model + scaler
    drought_model, scaler = train_drought_model()

    # 2. Fertilizer recommendation model
    fertilizer_model = train_fertilizer_model()

    # Summary
    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE - Saved Models:")
    print("=" * 60)
    for fname in ["drought_model.pkl", "scaler.pkl", "fertilizer_model.pkl"]:
        fpath = os.path.join(MODELS_DIR, fname)
        if os.path.exists(fpath):
            size_kb = os.path.getsize(fpath) / 1024
            print(f"  [OK] {fname:<30}  {size_kb:>8.1f} KB")
        else:
            print(f"  [MISSING] {fname}")
    print("=" * 60)
    print("\nAll models saved to backend/models/")


if __name__ == "__main__":
    main()
