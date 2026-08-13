from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import PredictionInput, InsightData
from app.routes.auth import verify_token
from app.ml.predict import predict_drought
from app.ml.explainer import get_shap_explainer_data, get_global_feature_importance, generate_natural_language_explanation

router = APIRouter(prefix="/api/insights", tags=["AI Insights"])

@router.post("", response_model=InsightData)
async def get_insights(request: PredictionInput, current_user: str = Depends(verify_token)):
    try:
        # Get predictions
        res = predict_drought(
            region=request.region,
            rainfall=request.rainfall,
            temperature=request.temperature,
            humidity=request.humidity,
            soil_moisture=request.soil_moisture
        )
        
        # Get SHAP values
        contributions = get_shap_explainer_data(res["features"])
        
        # Get natural language description
        explanation, top_factors = generate_natural_language_explanation(
            features_dict=request.dict(),
            contributions=contributions,
            prob=res["drought_probability"]
        )
        
        return {
            "feature_importance": get_global_feature_importance(),
            "shap_values": contributions,
            "explanation": explanation,
            "top_factors": top_factors
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feature-importance")
async def get_global_importance(current_user: str = Depends(verify_token)):
    try:
        return get_global_feature_importance()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
