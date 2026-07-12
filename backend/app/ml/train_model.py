import os
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

def main():
    print("Generating synthetic agricultural drought training dataset...")
    np.random.seed(42)
    n_samples = 5000
    
    # Generate realistic features
    # Rainfall (mm) in dry regions: 0 to 500
    rainfall = np.random.uniform(10.0, 500.0, n_samples)
    # Temperature (Celsius): 15 to 48
    temperature = np.random.uniform(15.0, 48.0, n_samples)
    # Humidity (%): 10 to 95
    humidity = np.random.uniform(10.0, 95.0, n_samples)
    # Soil Moisture (%): 5 to 90
    soil_moisture = np.random.uniform(5.0, 90.0, n_samples)
    # Region index (0 to 7)
    region_encoded = np.random.randint(0, 8, n_samples)
    
    # Create DataFrame
    df = pd.DataFrame({
        'rainfall': rainfall,
        'temperature': temperature,
        'humidity': humidity,
        'soil_moisture': soil_moisture,
        'region_encoded': region_encoded
    })
    
    # Define Target: drought (1 = drought, 0 = no drought)
    # Drought happens when rainfall is low, temp is high, soil moisture is low, humidity is low.
    # We define a scoring index and threshold
    score = (
        (500.0 - df['rainfall']) / 500.0 * 2.0 +
        (df['temperature'] - 15.0) / 33.0 * 1.5 +
        (100.0 - df['humidity']) / 100.0 * 1.0 +
        (100.0 - df['soil_moisture']) / 100.0 * 2.5
    )
    
    # Score range is roughly 0 to 7. Threshold at 4.2 for drought.
    drought_prob = 1.0 / (1.0 + np.exp(-3.0 * (score - 4.2))) # Sigmoid function
    
    # Add random noise
    df['drought'] = (drought_prob > np.random.uniform(0.0, 1.0, n_samples)).astype(int)
    
    print(f"Dataset generated. Drought class distribution:\n{df['drought'].value_counts(normalize=True)}")
    
    # Train test split
    X = df.drop(columns=['drought'])
    y = df['drought']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training XGBoost Classifier...")
    # Initialize XGBClassifier
    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model test accuracy: {accuracy * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Ensure backend directory exists and model path exists
    model_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_path = os.path.join(model_dir, "model.joblib")
    
    print(f"Saving model to {model_path}")
    joblib.dump(model, model_path)
    print("Model saved successfully!")

if __name__ == '__main__':
    main()
