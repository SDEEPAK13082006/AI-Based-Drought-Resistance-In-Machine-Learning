from fastapi import APIRouter, Depends
from app.models.schemas import IrrigationInput, IrrigationOutput
from app.routes.auth import verify_token
from app.data import demo_data

router = APIRouter(prefix="/api/irrigation", tags=["Irrigation Planner"])

@router.post("/plan", response_model=IrrigationOutput)
async def get_irrigation_plan(request: IrrigationInput, current_user: str = Depends(verify_token)):
    # Parse crop and lookup water needs
    crop_item = next((c for c in demo_data.CROPS_DB if c["name"].lower() == request.crop.lower()), None)
    
    # Base water requirement in Litres per Hectare per Day
    base_water = 3500.0  # Default value
    if crop_item:
        # Extract number from '250-350 mm'
        try:
            val = crop_item["water_requirement"].split("-")[0]
            val = float(''.join(c for c in val if c.isdigit() or c == '.'))
            base_water = val * 15.0 # Conversion factor to liters/hectare/day estimate
        except Exception:
            pass
            
    # Adjust based on soil moisture
    # If soil moisture is high (>70%), we don't need much water
    # If soil moisture is low (<20%), we need more water
    moisture_factor = max(0.1, (100.0 - request.soil_moisture) / 100.0)
    adjusted_water_per_hectare = base_water * moisture_factor
    total_water_requirement = round(adjusted_water_per_hectare * request.area_hectares, 1)
    
    # Recommended irrigation method based on region and soil moisture
    if request.soil_moisture < 20.0 or 'kutch' in request.region.lower() or 'barmer' in request.region.lower() or 'jaisalmer' in request.region.lower():
        method = "Drip Irrigation"
    elif request.soil_moisture < 45.0:
        method = "Sprinkler Irrigation"
    else:
        method = "Furrow/Surface Irrigation"
        
    method_info = demo_data.IRRIGATION_METHODS[method]
    
    # Generate schedule
    if request.soil_moisture >= 60.0:
        schedule = "No watering required today. Monitor soil moisture levels and irrigate in 3 days if moisture falls below 45%."
    elif request.soil_moisture >= 40.0:
        schedule = f"Irrigate every 3 days. Apply {round(total_water_requirement / 3.0, 1)} Litres per session early in the morning (5:00 AM - 7:00 AM) to minimize evapotranspiration."
    else:
        schedule = f"Critical moisture deficit. Irrigate immediately. Apply {round(total_water_requirement / 2.0, 1)} Litres today and repeat in 2 days. Best session: split between 6:00 AM and 6:00 PM."
        
    return {
        "water_requirement": total_water_requirement,
        "schedule": schedule,
        "method": method,
        "method_description": method_info["description"] + " " + method_info["suitability"],
        "efficiency": method_info["efficiency"]
    }
