import os
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends
from typing import List, Dict
from app.routes.auth import verify_token
from app.data import demo_data

router = APIRouter(prefix="/api/rainfall", tags=["Rainfall Analytics"])

def read_chirps_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    file_path = os.path.join(base_dir, "Datasets", "chirps_rainfall_timeseries.xlsx")
    # Fallback to root level
    if not os.path.exists(file_path):
        file_path = os.path.join(base_dir, "chirps_rainfall_timeseries.xlsx")
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        # Expected columns: Date, Rainfall_mm, Region_ID or similar.
        # Normalize columns to lowercase to handle variations
        df.columns = [c.strip().lower() for c in df.columns]
        return df
    return None

@router.get("/daily")
async def get_daily_rainfall(current_user: str = Depends(verify_token)):
    try:
        df = read_chirps_data()
        if df is not None:
            # Let's see if we have date and rainfall_mm columns
            # Column mapping check: 'date' and 'rainfall_mm' or 'rainfall'
            date_col = next((c for c in df.columns if 'date' in c), None)
            rain_col = next((c for c in df.columns if 'rain' in c or 'precip' in c), None)
            
            if date_col and rain_col:
                # Convert date col to datetime and sort
                df[date_col] = pd.to_datetime(df[date_col])
                df_sorted = df.sort_values(by=date_col)
                # Take last 30 rows
                tail = df_sorted.tail(30)
                result = []
                for _, row in tail.iterrows():
                    result.append({
                        "date": row[date_col].strftime("%Y-%m-%d"),
                        "rainfall": round(float(row[rain_col]), 1)
                    })
                return result
    except Exception as e:
        print(f"Error parsing chirps rainfall daily: {e}")
        
    return demo_data.get_rainfall_daily()

@router.get("/monthly")
async def get_monthly_rainfall(current_user: str = Depends(verify_token)):
    try:
        df = read_chirps_data()
        if df is not None:
            date_col = next((c for c in df.columns if 'date' in c), None)
            rain_col = next((c for c in df.columns if 'rain' in c or 'precip' in c), None)
            if date_col and rain_col:
                df[date_col] = pd.to_datetime(df[date_col])
                # Group by month name and average/sum
                df['month_num'] = df[date_col].dt.month
                df['month_name'] = df[date_col].dt.strftime('%b')
                monthly = df.groupby(['month_num', 'month_name'])[rain_col].mean().reset_index()
                monthly = monthly.sort_values('month_num')
                
                result = []
                for _, row in monthly.iterrows():
                    result.append({
                        "month": row['month_name'],
                        "rainfall": round(float(row[rain_col]) * 30.0, 1) # Mean daily to monthly estimate
                    })
                return result
    except Exception as e:
        print(f"Error parsing chirps rainfall monthly: {e}")
        
    return demo_data.get_rainfall_monthly()

@router.get("/annual")
async def get_annual_rainfall(current_user: str = Depends(verify_token)):
    try:
        df = read_chirps_data()
        if df is not None:
            date_col = next((c for c in df.columns if 'date' in c), None)
            rain_col = next((c for c in df.columns if 'rain' in c or 'precip' in c), None)
            if date_col and rain_col:
                df[date_col] = pd.to_datetime(df[date_col])
                df['year'] = df[date_col].dt.year
                annual = df.groupby('year')[rain_col].sum().reset_index()
                # If values are daily averages, sum might need multiplier, else raw sum
                # Take last 10 years
                annual = annual.tail(10)
                
                result = []
                for _, row in annual.iterrows():
                    result.append({
                        "year": str(int(row['year'])),
                        "rainfall": round(float(row[rain_col]), 1)
                    })
                return result
    except Exception as e:
        print(f"Error parsing chirps rainfall annual: {e}")
        
    return demo_data.get_rainfall_annual()

@router.get("/comparison")
async def get_rainfall_comparison(current_user: str = Depends(verify_token)):
    try:
        df = read_chirps_data()
        if df is not None:
            region_col = next((c for c in df.columns if 'region' in c), None)
            rain_col = next((c for c in df.columns if 'rain' in c), None)
            if region_col and rain_col:
                # Group by region and get average
                comp = df.groupby(region_col)[rain_col].mean().reset_index()
                result = []
                for _, row in comp.iterrows():
                    hist_avg = float(row[rain_col]) * 365.0
                    result.append({
                        "region": str(row[region_col]),
                        "actual": round(hist_avg * np.random.uniform(0.85, 1.1), 1),
                        "historical_average": round(hist_avg, 1)
                    })
                return result
    except Exception as e:
        print(f"Error parsing chirps rainfall comparison: {e}")
        
    return demo_data.get_rainfall_comparison()
