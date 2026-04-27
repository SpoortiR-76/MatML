import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.steel import SteelInput, SteelPrediction
from app.services.steel_service import run_steel_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/steel", response_model=SteelPrediction, summary="Predict steel mechanical properties")
async def predict_steel_endpoint(input_data: SteelInput, request: Request):
    """
    Predict yield strength, tensile strength, and elongation of a steel alloy
    from its elemental composition (all values in wt%).

    - Returns three predicted properties simultaneously
    - SHAP values show which alloying elements drive strength/ductility
    """
    logger.info("Steel prediction request received: %s", input_data.model_dump())

    try:
        result = run_steel_prediction(
            models=request.app.state.models,
            input_data=input_data.model_dump(),
        )
        return result
    except ValueError as exc:
        logger.warning("Steel validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Unhandled error in /steel: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed. Please check inputs and retry.")
