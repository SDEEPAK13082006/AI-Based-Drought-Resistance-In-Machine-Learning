from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.schemas import CropItem
from app.routes.auth import verify_token
from app.data.demo_data import CROPS_DB

router = APIRouter(prefix="/api/crops", tags=["Crop Recommendation"])

@router.get("", response_model=List[CropItem])
async def get_crops(region: Optional[str] = None, current_user: str = Depends(verify_token)):
    crops = CROPS_DB.copy()
    
    # Simple logic to filter or adjust crops based on dry region type
    if region:
        region = region.lower()
        if 'kutch' in region or 'barmer' in region or 'jaisalmer' in region:
            # Extreme dry crops are prioritized (Millet, sesame, safflower, cluster bean)
            crops.sort(key=lambda x: 1 if x["drought_resistance"] in ["Excellent", "Outstanding"] else 2)
        elif 'bundelkhand' in region:
            # Pearl millet, chickpea, cowpea, mustard are good
            crops.sort(key=lambda x: 1 if x["name"] in ["Pearl Millet (Bajra)", "Chickpea (Gram)", "Mustard"] else 2)
            
    return crops

@router.get("/all", response_model=List[CropItem])
async def get_all_crops(current_user: str = Depends(verify_token)):
    return CROPS_DB
