from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import PredictionInput, PredictionOutput
from app.routes.auth import verify_token
from app.ml.predict import predict_drought
from app.ml.explainer import get_shap_explainer_data, generate_natural_language_explanation

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict", response_model=PredictionOutput)
async def predict(request: PredictionInput, current_user: str = Depends(verify_token)):
    try:
        # Run prediction
        res = predict_drought(
            region=request.region,
            rainfall=request.rainfall,
            temperature=request.temperature,
            humidity=request.humidity,
            soil_moisture=request.soil_moisture
        )
        
        # Get local feature contributions via SHAP TreeExplainer
        contributions = get_shap_explainer_data(res["features"])
        
        # Generate text explanation
        explanation, _ = generate_natural_language_explanation(
            features_dict=request.dict(),
            contributions=contributions,
            prob=res["drought_probability"]
        )
        
        return {
            "drought_probability": res["drought_probability"],
            "risk_level": res["risk_level"],
            "confidence_score": res["confidence_score"],
            "explanation": explanation,
            "feature_contributions": contributions
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
