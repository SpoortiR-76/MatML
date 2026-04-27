import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.materials import MaterialsInput, MaterialsPrediction
from app.services.materials_service import run_materials_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/materials", response_model=MaterialsPrediction, summary="Predict material strength and suitability")
async def predict_materials_endpoint(input_data: MaterialsInput, request: Request):
    """
    Predict ultimate strength (Su), yield strength (Sy), and structural
    suitability (Use) for a material given its elastic properties and density.

    - **E**: Young's Modulus — stiffness under tension/compression
    - **G**: Shear Modulus — stiffness under shear
    - **mu**: Poisson's Ratio — lateral deformation ratio
    - **Ro**: Density (kg/m³)
    - Returns regression predictions + classification with confidence
    """
    logger.info("Materials prediction request received: %s", input_data.model_dump())

    try:
        result = run_materials_prediction(
            models=request.app.state.models,
            input_data=input_data.model_dump(),
        )
        return result
    except ValueError as exc:
        logger.warning("Materials validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Unhandled error in /materials: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed. Please check inputs and retry.")
