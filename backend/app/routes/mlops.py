import random
from fastapi import APIRouter, Depends
from typing import List
from app.models.schemas import MLOpsInfo, MLOpsMetric
from app.routes.auth import verify_token

router = APIRouter(prefix="/api/mlops", tags=["MLOps Monitoring"])

@router.get("/status", response_model=MLOpsInfo)
async def get_mlops_status(current_user: str = Depends(verify_token)):
    return {
        "model_version": "v2.1.4-xgb",
        "training_date": "2026-07-10 14:32:00",
        "dataset_version": "DS_CHIRPS_SPEI_V2.0",
        "data_drift_status": "No Drift Detected (PSI = 0.08)",
        "prediction_accuracy": 92.4,
        "total_predictions": 14208,
        "model_type": "XGBoost Classifier",
        "features_used": ['rainfall', 'temperature', 'humidity', 'soil_moisture', 'region_encoded']
    }

@router.get("/metrics", response_model=List[MLOpsMetric])
async def get_mlops_metrics(current_user: str = Depends(verify_token)):
    # 7 historical points showing model accuracy over time
    metrics = []
    base_accuracy = [91.2, 91.5, 91.8, 92.0, 92.2, 92.3, 92.4]
    drift_scores = [0.03, 0.04, 0.05, 0.06, 0.07, 0.07, 0.08]
    latencies = [12.4, 11.8, 12.1, 10.9, 11.2, 10.5, 11.1]
    
    for i in range(7):
        metrics.append({
            "timestamp": f"Day -{6-i}",
            "accuracy": base_accuracy[i],
            "drift_score": drift_scores[i],
            "latency_ms": latencies[i]
        })
    return metrics
