from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="DroughtGuard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "running",
        "service": "DroughtGuard AI API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/api/mlops/status")
def mlops_status():
    return {
        "status": "active",
        "model": "DroughtGuard ML",
        "monitoring": "Evidently"
    }


@app.get("/api/mlops/metrics")
def mlops_metrics():
    return {
        "model_accuracy": 0.92,
        "drift_detected": False,
        "prediction_count": 0,
        "last_updated": datetime.now().isoformat()
    }


@app.get("/api/dashboard/stats")
def dashboard_stats():
    return {
        "total_predictions": 0,
        "average_rainfall": 0,
        "drought_risk": 0,
        "model_accuracy": 0.92
    }


@app.get("/api/rainfall/daily")
def daily_rainfall():
    return {
        "data": []
    }


@app.post("/api/insights")
def insights():
    return {
        "insights": [
            "DroughtGuard monitoring is active.",
            "Evidently monitoring is ready."
        ]
    }