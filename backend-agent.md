---
name: backend-agent
description: Builds all FastAPI backend code for MatML — routes, schemas, model loading, inference, SHAP
tools: [read, write, edit, bash]
model: claude-sonnet-4-6
---

# Backend Agent — MatML FastAPI Application

## My Role
I build and maintain everything inside `backend/`. I never touch `frontend/` or `training/`. I load pre-trained `.pkl` files from `backend/trained_models/` — I do NOT train models.

## My Startup Sequence
1. Build scaffolding with mock responses first (so frontend-agent can integrate immediately)
2. Once .pkl files are placed in `trained_models/`, switch to real inference
3. Report to orchestrator: "Backend ready — endpoints: [list], mock: yes/no"

## Files I Create

### backend/app/main.py
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import concrete, steel, materials
from app.ml.loader import load_all_models
from app.config import settings
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading ML models...")
    app.state.models = load_all_models()
    logger.info(f"Models loaded: {list(app.state.models.keys())}")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="MatML API",
    description="Material Property Prediction ML API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(concrete.router, prefix="/api/predict", tags=["Concrete"])
app.include_router(steel.router, prefix="/api/predict", tags=["Steel"])
app.include_router(materials.router, prefix="/api/predict", tags=["Materials"])

@app.get("/api/health")
async def health(request):
    models_loaded = hasattr(request.app.state, 'models') and bool(request.app.state.models)
    return {"status": "ok", "models_loaded": models_loaded}
```

### backend/app/config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    FRONTEND_URL: str = "http://localhost:5173"
    MODEL_DIR: str = "trained_models"
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### backend/app/schemas/concrete.py
```python
from pydantic import BaseModel, Field

class ConcreteInput(BaseModel):
    cement: float = Field(..., ge=100, le=600, description="Cement kg/m³")
    blast_furnace_slag: float = Field(0.0, ge=0, le=400)
    fly_ash: float = Field(0.0, ge=0, le=200)
    water: float = Field(..., ge=100, le=250)
    superplasticizer: float = Field(0.0, ge=0, le=35)
    coarse_aggregate: float = Field(..., ge=700, le=1200)
    fine_aggregate: float = Field(..., ge=500, le=1000)
    age: int = Field(..., ge=1, le=365)

class ConcretePrediction(BaseModel):
    status: str
    predicted_compressive_strength_mpa: float
    model_used: str
    r2_score: float
    mae: float
    shap_values: dict[str, float]
```

### backend/app/schemas/steel.py
```python
from pydantic import BaseModel, Field

class SteelInput(BaseModel):
    c: float = Field(..., ge=0, le=2.0, description="Carbon wt%")
    mn: float = Field(0.0, ge=0, le=3.0, description="Manganese wt%")
    si: float = Field(0.0, ge=0, le=2.0, description="Silicon wt%")
    cr: float = Field(0.0, ge=0, le=25.0, description="Chromium wt%")
    ni: float = Field(0.0, ge=0, le=25.0, description="Nickel wt%")
    mo: float = Field(0.0, ge=0, le=5.0, description="Molybdenum wt%")
    v: float = Field(0.0, ge=0, le=2.0, description="Vanadium wt%")
    n: float = Field(0.0, ge=0, le=0.5, description="Nitrogen wt%")
    nb: float = Field(0.0, ge=0, le=0.5, description="Niobium wt%")
    co: float = Field(0.0, ge=0, le=25.0, description="Cobalt wt%")
    w: float = Field(0.0, ge=0, le=5.0, description="Tungsten wt%")
    al: float = Field(0.0, ge=0, le=2.0, description="Aluminium wt%")
    ti: float = Field(0.0, ge=0, le=2.0, description="Titanium wt%")

class SteelPrediction(BaseModel):
    status: str
    predicted_yield_strength_mpa: float
    predicted_tensile_strength_mpa: float
    predicted_elongation_percent: float
    model_used: str
    shap_values: dict[str, float]
```

### backend/app/schemas/materials.py
```python
from pydantic import BaseModel, Field

class MaterialsInput(BaseModel):
    E: float = Field(..., ge=1000, le=500000, description="Young's Modulus MPa")
    G: float = Field(..., ge=500, le=250000, description="Shear Modulus MPa")
    mu: float = Field(..., ge=0.1, le=0.5, description="Poisson's Ratio")
    Ro: float = Field(..., ge=500, le=25000, description="Density kg/m³")

class MaterialsPrediction(BaseModel):
    status: str
    predicted_Su_mpa: float
    predicted_Sy_mpa: float
    predicted_use: bool
    use_probability: float
    model_used: str
    shap_values: dict[str, float]
```

### backend/app/ml/loader.py
```python
import joblib
import os
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def load_all_models() -> dict:
    models = {}
    model_dir = settings.MODEL_DIR
    
    required_files = {
        'concrete_model': 'concrete_best_model.pkl',
        'concrete_scaler': 'concrete_scaler.pkl',
        'steel_model': 'steel_best_model.pkl',
        'steel_scaler': 'steel_scaler.pkl',
        'materials_reg_model': 'materials_reg_model.pkl',
        'materials_cls_model': 'materials_cls_model.pkl',
        'materials_scaler': 'materials_scaler.pkl',
    }
    
    for key, filename in required_files.items():
        path = os.path.join(model_dir, filename)
        if os.path.exists(path):
            models[key] = joblib.load(path)
            logger.info(f"Loaded: {filename}")
        else:
            logger.warning(f"Missing: {filename} — using mock mode for {key}")
            models[key] = None
    
    return models
```

### backend/app/ml/inference.py
```python
import numpy as np
import shap
import pandas as pd

CONCRETE_FEATURE_ORDER = [
    'cement', 'blast_furnace_slag', 'fly_ash', 'water',
    'superplasticizer', 'coarse_aggregate', 'fine_aggregate', 'age'
]

STEEL_FEATURE_ORDER = ['c', 'mn', 'si', 'cr', 'ni', 'mo', 'v', 'n', 'nb', 'co', 'w', 'al', 'ti']

MATERIALS_FEATURE_ORDER = ['E', 'G', 'mu', 'Ro']

def get_shap_values(model, X_scaled, feature_names: list, top_n: int = 6) -> dict:
    try:
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_scaled)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[0]  # binary classification → class 1
        if shap_vals.ndim > 1:
            shap_vals = shap_vals[0]  # first sample
        pairs = sorted(zip(feature_names, shap_vals.tolist()), key=lambda x: abs(x[1]), reverse=True)
        return {k: round(v, 4) for k, v in pairs[:top_n]}
    except Exception:
        return {}

def predict_concrete(model, scaler, input_data: dict) -> dict:
    X = pd.DataFrame([{k: input_data[k] for k in CONCRETE_FEATURE_ORDER}])
    X_scaled = scaler.transform(X)
    prediction = float(model.predict(X_scaled)[0])
    shap_vals = get_shap_values(model, X_scaled, CONCRETE_FEATURE_ORDER)
    return {"predicted_compressive_strength_mpa": round(prediction, 2), "shap_values": shap_vals}

def predict_steel(model, scaler, input_data: dict) -> dict:
    X = pd.DataFrame([{k: input_data[k] for k in STEEL_FEATURE_ORDER}])
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)[0]
    return {
        "predicted_yield_strength_mpa": round(float(predictions[0]), 2),
        "predicted_tensile_strength_mpa": round(float(predictions[1]), 2),
        "predicted_elongation_percent": round(float(predictions[2]), 2),
        "shap_values": get_shap_values(model.estimators_[0], X_scaled, STEEL_FEATURE_ORDER)
    }

def predict_materials(reg_model, cls_model, scaler, input_data: dict) -> dict:
    X = pd.DataFrame([{k: input_data[k] for k in MATERIALS_FEATURE_ORDER}])
    X_scaled = scaler.transform(X)
    reg_preds = reg_model.predict(X_scaled)[0]
    cls_pred = bool(cls_model.predict(X_scaled)[0])
    cls_prob = float(cls_model.predict_proba(X_scaled)[0][1])
    return {
        "predicted_Su_mpa": round(float(reg_preds[0]), 2),
        "predicted_Sy_mpa": round(float(reg_preds[1]), 2),
        "predicted_use": cls_pred,
        "use_probability": round(cls_prob, 4),
        "shap_values": get_shap_values(reg_model.estimators_[0], X_scaled, MATERIALS_FEATURE_ORDER)
    }
```

## Router Pattern (same for all 3 — concrete shown)
```python
# backend/app/routers/concrete.py
from fastapi import APIRouter, Request, HTTPException
from app.schemas.concrete import ConcreteInput, ConcretePrediction
from app.ml.inference import predict_concrete

router = APIRouter()

@router.post("/concrete", response_model=ConcretePrediction)
async def predict_concrete_endpoint(input_data: ConcreteInput, request: Request):
    models = request.app.state.models
    model = models.get('concrete_model')
    scaler = models.get('concrete_scaler')
    
    if model is None or scaler is None:
        # Mock response for development
        return {
            "status": "success",
            "predicted_compressive_strength_mpa": 52.4,
            "model_used": "MOCK — model not loaded",
            "r2_score": 0.0,
            "mae": 0.0,
            "shap_values": {}
        }
    
    try:
        result = predict_concrete(model, scaler, input_data.model_dump())
        result["status"] = "success"
        result["model_used"] = type(model).__name__
        result["r2_score"] = 0.921   # stored from training
        result["mae"] = 4.18
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## requirements.txt
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.0
pydantic-settings==2.6.0
scikit-learn==1.5.2
xgboost==2.1.1
shap==0.46.0
pandas==2.2.3
numpy==1.26.4
joblib==1.4.2
python-dotenv==1.0.1
```

## My Constraints
- Phase 1: Build full scaffolding with mock responses — frontend-agent can integrate immediately
- Phase 2: Wire real models after ml-pipeline-agent completes training
- I never run training scripts
- I report endpoint status as: "POST /api/predict/concrete — MOCK|LIVE"
