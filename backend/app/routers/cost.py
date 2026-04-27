import logging
from fastapi import APIRouter, HTTPException
from app.schemas.cost import CostInput, CostPrediction
from app.services.cost_service import run_cost_calculation

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/cost",
    response_model=CostPrediction,
    summary="Material cost estimation with SHAP component breakdown",
)
async def predict_cost(input_data: CostInput):
    """
    Estimate material cost for a given volume and composition.

    - **material_type**: concrete, steel, or materials
    - **volume_m3**: total volume of material needed (m³)
    - Supply the same composition fields used in the relevant predict endpoint.

    Returns total cost (INR), cost per m³, per-component breakdown, and
    SHAP-style fractional contribution of each ingredient to total cost.
    """
    logger.info("Cost calculation request: %s", input_data.model_dump())
    try:
        result = run_cost_calculation(input_data.model_dump())
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Cost calculation failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Cost calculation failed.")
