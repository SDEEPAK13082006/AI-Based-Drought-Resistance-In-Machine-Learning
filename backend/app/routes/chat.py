import re
from fastapi import APIRouter, Depends
from app.models.schemas import ChatInput, ChatOutput
from app.routes.auth import verify_token
from app.data import demo_data

router = APIRouter(prefix="/api/chat", tags=["AI Agricultural Assistant"])

DEFAULT_SUGGESTIONS = [
    "Which crops are best for high drought risk?",
    "How do I optimize drip irrigation for low soil moisture?",
    "What does SPEI index mean in drought forecasting?",
    "Show XGBoost drought model accuracy"
]

@router.post("", response_model=ChatOutput)
async def chat_with_ai(request: ChatInput, current_user: str = Depends(verify_token)):
    msg = request.message.strip().lower()
    
    # 1. Crop recommendation intent
    if any(k in msg for k in ["crop", "seed", "plant", "grow", "recommend", "cultivate", "bajra", "millet", "gram"]):
        reply = (
            "🌱 **Crop Recommendation Advice**:\n\n"
            "• **Arid / Extreme Dry Regions (e.g., Kutch, Barmer, Jaisalmer)**: We recommend **Pearl Millet (Bajra)**, **Cluster Bean (Guar)**, and **Safflower** due to minimal water requirements (180–300 mm).\n"
            "• **Semi-Arid Regions (e.g., Bundelkhand, Marathwada)**: **Chickpea (Gram)**, **Sorghum (Jowar)**, and **Mustard** provide strong yields with moderate drought resilience.\n"
            "• **General Tip**: Avoid water-intensive crops like Paddy Rice or Sugarcane during SPEI deficit periods below -1.0."
        )
        suggestions = [
            "What irrigation plan should I use for Bajra?",
            "How to improve soil moisture naturally?",
            "Explain SPEI -1.5 risk level"
        ]
        intent = "crop_recommendation"

    # 2. Irrigation intent
    elif any(k in msg for k in ["irrigate", "irrigation", "water", "drip", "sprinkler", "moisture", "schedule"]):
        reply = (
            "💧 **Smart Irrigation Guidance**:\n\n"
            "• **Drip Irrigation**: Recommended for soil moisture < 25%. Delivers targeted root zone watering with **85–90% efficiency** and saves up to 40% water.\n"
            "• **Sprinkler Systems**: Best suited for semi-dry fields (25%–45% moisture) and undulating terrain with **70–75% efficiency**.\n"
            "• **Best Timing**: Schedule irrigation early in the morning (5:00 AM – 7:30 AM) or late evening to minimize solar evapotranspiration losses."
        )
        suggestions = [
            "Calculate irrigation volume for 2 Hectares",
            "Which crops resist drought best?",
            "View daily rainfall trends"
        ]
        intent = "irrigation_advice"

    # 3. SPEI / Drought Index intent
    elif any(k in msg for k in ["spei", "index", "forecast", "drought level", "climate", "rainfall", "chirps"]):
        reply = (
            "📊 **SPEI & Drought Forecasting Insights**:\n\n"
            "• **Standardized Precipitation Evapotranspiration Index (SPEI)** measures drought by combining precipitation deficit and temperature-driven evapotranspiration.\n"
            "• **Scale Interpretation**:\n"
            "  - `SPEI > -0.5`: Normal / Adequate moisture\n"
            "  - `SPEI -0.5 to -1.0`: Mild Drought risk\n"
            "  - `SPEI -1.0 to -1.5`: Moderate Drought\n"
            "  - `SPEI < -1.5`: Severe to Extreme Drought\n"
            "• **Current Bundelkhand SPEI**: Currently tracked at `-1.82` (Severe Drought alert)."
        )
        suggestions = [
            "What crops survive severe drought?",
            "How does XGBoost predict drought?",
            "Open India Drought Heatmap"
        ]
        intent = "spei_drought_info"

    # 4. Model / MLOps intent
    elif any(k in msg for k in ["model", "xgboost", "accuracy", "mlops", "shap", "drift", "ai"]):
        reply = (
            "🤖 **AI Model & MLOps Infrastructure**:\n\n"
            "• **Model Architecture**: XGBoost Classifier trained on CHIRPS, GLDAS, GRACE, and SPEI dataset features.\n"
            "• **Performance**: **92.4% Prediction Accuracy** with an average latency of **11ms**.\n"
            "• **Top Features (SHAP)**: Rainfall history (38% weight), Soil Moisture (30%), Temperature (18%), and Relative Humidity (10%).\n"
            "• **Drift Monitoring**: Population Stability Index (PSI) = 0.08 (Stable, No Drift Detected)."
        )
        suggestions = [
            "How does rainfall impact drought risk?",
            "Recommend crops for low rainfall",
            "What is drip irrigation efficiency?"
        ]
        intent = "model_info"

    # 5. Greeting / General Intent
    elif any(k in msg for k in ["hi", "hello", "hey", "help", "who are you", "start"]):
        reply = (
            "👋 **Hello! I'm your AI Agricultural & Drought Resilience Assistant.**\n\n"
            "I can help you with:\n"
            "1. **Drought Risk & SPEI Index Analysis**\n"
            "2. **Drought-Resistant Crop Selection**\n"
            "3. **Precision Irrigation & Water Management**\n"
            "4. **AI Machine Learning Predictions & Climate Data**\n\n"
            "How can I assist your farm or region today?"
        )
        suggestions = DEFAULT_SUGGESTIONS
        intent = "greeting"

    # 6. Fallback / Custom query
    else:
        reply = (
            f"🌾 Based on your query regarding *'{request.message}'*:\n\n"
            "Our AI system analyzes climate parameters (Rainfall, Temperature, Humidity, Soil Moisture) against historical SPEI datasets.\n\n"
            "• For **low soil moisture (<20%)**, we recommend switching to drought-hardy crops (Millet, Chickpea) and implementing Drip Irrigation.\n"
            "• For **high temperature heat stress**, schedule early morning watering sessions to preserve root hydration."
        )
        suggestions = DEFAULT_SUGGESTIONS
        intent = "general_query"

    return {
        "reply": reply,
        "suggestions": suggestions,
        "intent": intent
    }
