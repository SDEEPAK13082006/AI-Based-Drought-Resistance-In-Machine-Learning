import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Smart Drought Resistance Management API",
    description="FastAPI Backend powering the AI-driven Drought Prediction & Agriculture Planner System.",
    version="1.0.0"
)

# Enable CORS for localhost React frontend on any port, Vercel and Render deployment domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "https://ai-based-drought-resistance.vercel.app",
        "https://ai-based-drought-resistance-huwsp5xok-code-ninjas4.vercel.app",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$|^https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
from app.routes import auth, dashboard, prediction, crops, rainfall, heatmap, irrigation, insights, mlops, chat

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(prediction.router)
app.include_router(crops.router)
app.include_router(rainfall.router)
app.include_router(heatmap.router)
app.include_router(irrigation.router)
app.include_router(insights.router)
app.include_router(mlops.router)
app.include_router(chat.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to Smart Drought Resistance Management AI API",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    model_status = "not_loaded"
    try:
        from app.ml.predict import load_model
        load_model()
        model_status = "ready"
    except Exception as e:
        model_status = f"error: {str(e)}"
        
    return {
        "status": "healthy",
        "model": model_status
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
