import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.ml.loader import load_all_models
from app.routers import concrete, enhanced_steel, materials, steel, structural
from app.utils.logger import setup_logging

# ── Logging must be configured before anything else ────────────────────────
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


# ── Lifespan: load models once at startup ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("MatML API starting up — loading ML models...")
    app.state.models = load_all_models()
    loaded = [k for k, v in app.state.models.items() if v is not None]
    logger.info("Startup complete. Live models: %s", loaded)
    yield
    logger.info("MatML API shutting down.")


# ── App factory ────────────────────────────────────────────────────────────
app = FastAPI(
    title="MatML API",
    description=(
        "Material Property Prediction API v2.0 — predict mechanical properties of "
        "concrete, steel alloys, and general engineering materials using ML models "
        "trained on real laboratory datasets. "
        "v2.0 adds the Enhanced Steel six-module engine: elastic moduli, thermal, "
        "pre/post-repair strength, degradation profile, use suitability, and grade recommendation."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────
allowed_origins = list({settings.FRONTEND_URL, "http://localhost:5173"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(concrete.router,       prefix="/api/predict", tags=["Concrete"])
app.include_router(steel.router,          prefix="/api/predict", tags=["Steel"])
app.include_router(enhanced_steel.router, prefix="/api/predict", tags=["Enhanced Steel"])
app.include_router(materials.router,      prefix="/api/predict", tags=["Materials"])
app.include_router(structural.router,     prefix="/api/predict", tags=["Structural"])



# ── Health check ───────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"], summary="Health check — model status")
async def health(request: Request):
    models: dict = getattr(request.app.state, "models", {})
    loaded_models = [k for k, v in models.items() if v is not None]
    return {
        "status": "ok",
        "models_loaded": bool(loaded_models),
        "loaded_models": loaded_models,
    }


# ── Global exception handler ──────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An unexpected error occurred.",
            "detail": str(exc),
        },
    )
