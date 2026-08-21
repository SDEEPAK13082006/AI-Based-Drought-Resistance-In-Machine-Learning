import os
import pandas as pd
from fastapi import APIRouter, Depends
from app.models.schemas import DashboardStats
from app.routes.auth import verify_token
from app.data import demo_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: str = Depends(verify_token)):
    stats = demo_data.get_dashboard_stats()
    
    # Try reading real SPEI from bundelkhand_spei.xlsx
    try:
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        project_dir = os.path.dirname(backend_dir)
        possible_paths = [
            os.path.join(project_dir, "Datasets", "bundelkhand_spei.xlsx"),
            os.path.join(backend_dir, "Datasets", "bundelkhand_spei.xlsx"),
            os.path.join(project_dir, "bundelkhand_spei.xlsx"),
            os.path.join(backend_dir, "bundelkhand_spei.xlsx"),
        ]
        spei_file = next((p for p in possible_paths if os.path.exists(p)), None)
        
        if spei_file:
            # Read excel using pandas
            df = pd.read_excel(spei_file)
            df.columns = [c.strip().lower() for c in df.columns]
            if not df.empty and 'spei' in df.columns:
                # Get the latest row
                latest_row = df.iloc[-1]
                latest_spei = float(latest_row['spei'])
                
                # Overwrite mockup SPEI and drought levels based on SPEI index
                stats["spei"] = round(latest_spei, 2)
                
                # Standard SPEI thresholds:
                # SPEI <= -2.0: Extreme Drought
                # SPEI <= -1.5: Severe Drought
                # SPEI <= -1.0: Moderate Drought
                # SPEI <= -0.5: Mild Drought
                # SPEI > -0.5: No Drought
                if latest_spei <= -2.0:
                    stats["drought_level"] = "Extreme Drought"
                    stats["ai_risk_score"] = round(0.9 + (abs(latest_spei) - 2.0)*0.05, 2)
                elif latest_spei <= -1.5:
                    stats["drought_level"] = "Severe Drought"
                    stats["ai_risk_score"] = round(0.75 + (abs(latest_spei) - 1.5)*0.15, 2)
                elif latest_spei <= -1.0:
                    stats["drought_level"] = "Moderate Drought"
                    stats["ai_risk_score"] = round(0.50 + (abs(latest_spei) - 1.0)*0.25, 2)
                elif latest_spei <= -0.5:
                    stats["drought_level"] = "Mild Drought"
                    stats["ai_risk_score"] = round(0.25 + (abs(latest_spei) - 0.5)*0.25, 2)
                else:
                    stats["drought_level"] = "No Drought"
                    stats["ai_risk_score"] = round(max(0.05, 0.25 - (latest_spei + 0.5)*0.1), 2)
                    
                stats["region"] = "Bundelkhand"
                stats["water_availability"] = "Critical (18%)" if latest_spei <= -1.5 else "Low (35%)" if latest_spei <= -0.5 else "Adequate (62%)"
    except Exception as e:
        print(f"Error reading bundelkhand_spei.xlsx: {e}. Falling back to demo data.")
        
    return stats
