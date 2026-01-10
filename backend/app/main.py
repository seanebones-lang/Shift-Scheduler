from typing import List, Dict
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from datetime import datetime, timedelta

app = FastAPI(title="ShiftAI Scheduler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastInterval(BaseModel):
    time: str
    demand: float
    confidence_low: float
    confidence_high: float

class Forecast(BaseModel):
    intervals: List[ForecastInterval]

class Shift(BaseModel):
    staff_id: str
    name: str
    start: str
    end: str
    cost: float

class Schedule(BaseModel):
    shifts: List[Shift]
    total_cost: float

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/forecast", response_model=Forecast)
async def forecast_sales(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        if 'sales' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must have 'sales' column")
        base_demand = df['sales'].mean()
        intervals = []
        for i in range(168):  # 7 days hourly
            dt = datetime.now() + timedelta(hours=i)
            demand = base_demand * (1.5 if 8 <= dt.hour < 18 else 0.7)  # peak hours
            low, high = demand * 0.8, demand * 1.2
            intervals.append(ForecastInterval(
                time=dt.isoformat(),
                demand=round(demand, 2),
                confidence_low=round(low, 2),
                confidence_high=round(high, 2)
            ))
        return Forecast(intervals=intervals)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize", response_model=Schedule)
async def optimize_shifts(forecast_file: UploadFile = File(...), staff_file: UploadFile = File(...)):
    if not all(f.filename.endswith('.csv') for f in [forecast_file, staff_file]):
        raise HTTPException(status_code=400, detail="CSV files required")
    f_content = await forecast_file.read()
    s_content = await staff_file.read()
    try:
        staff_df = pd.read_csv(io.BytesIO(s_content))
        if not {'id', 'name', 'wage', 'skill'} <= set(staff_df.columns):
            raise HTTPException(status_code=400, detail="Staff CSV columns: id,name,wage,skill")
        shifts = []
        total_cost = 0
        for _, row in staff_df.iterrows():
            start = datetime.now().isoformat()
            end = (datetime.now() + timedelta(hours=8)).isoformat()
            cost = row['wage'] * 8
            shifts.append(Shift(
                staff_id=str(row['id']),
                name=row['name'],
                start=start,
                end=end,
                cost=float(cost)
            ))
            total_cost += float(cost)
        return Schedule(shifts=shifts, total_cost=round(total_cost, 2))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
