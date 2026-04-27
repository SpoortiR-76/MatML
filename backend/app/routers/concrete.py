import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.concrete import ConcreteInput, ConcretePrediction
from app.services.concrete_service import run_concrete_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/concrete", response_model=ConcretePrediction, summary="Predict concrete compressive strength")
async def predict_concrete_endpoint(input_data: ConcreteInput, request: Request):
    """
    Predict the compressive strength (MPa) of concrete from mix composition.

    - **cement**: Primary binder (kg/m³)
    - **water**: Lower ratio = higher strength (kg/m³)
    - **age**: Curing days (1–365)
    - Returns predicted strength + SHAP feature contributions
    """
    logger.info("Concrete prediction request received: %s", input_data.model_dump())

    try:
        result = run_concrete_prediction(
            models=request.app.state.models,
            input_data=input_data.model_dump(),
        )
        return result
    except ValueError as exc:
        logger.warning("Concrete validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Unhandled error in /concrete: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed. Please check inputs and retry.")
