from fastapi import APIRouter, Depends
from typing import List
from app.routes.auth import verify_token
from app.data import demo_data

router = APIRouter(prefix="/api/heatmap", tags=["India Drought Heat Map"])

@router.get("/states")
async def get_heatmap_states(current_user: str = Depends(verify_token)):
    return demo_data.get_heatmap_data()
