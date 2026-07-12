from pydantic import BaseModel
from typing import List, Dict, Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class PredictionInput(BaseModel):
    region: str
    rainfall: float
    temperature: float
    humidity: float
    soil_moisture: float

class PredictionOutput(BaseModel):
    drought_probability: float
    risk_level: str
    confidence_score: float
    explanation: str
    feature_contributions: Dict[str, float]

class CropItem(BaseModel):
    name: str
    water_requirement: str
    growth_period: str
    expected_yield: str
    profit_estimate: str
    drought_resistance: str
    image_emoji: str

class IrrigationInput(BaseModel):
    crop: str
    region: str
    soil_moisture: float
    area_hectares: float

class IrrigationOutput(BaseModel):
    water_requirement: float
    schedule: str
    method: str
    method_description: str
    efficiency: float

class DashboardStats(BaseModel):
    drought_level: str
    ai_risk_score: float
    todays_rainfall: float
    spei: float
    region: str
    water_availability: str
    crop_recommendation: str
    model_accuracy: float

class MLOpsInfo(BaseModel):
    model_version: str
    training_date: str
    dataset_version: str
    data_drift_status: str
    prediction_accuracy: float
    total_predictions: int
    model_type: str
    features_used: List[str]

class MLOpsMetric(BaseModel):
    timestamp: str
    accuracy: float
    drift_score: float
    latency_ms: float

class InsightData(BaseModel):
    feature_importance: Dict[str, float]
    shap_values: Dict[str, float]
    explanation: str
    top_factors: List[str]
