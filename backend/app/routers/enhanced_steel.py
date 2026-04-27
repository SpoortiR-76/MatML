"""
Enhanced Steel router — /api/predict/enhanced-steel (POST)
===========================================================
Additive endpoint — the existing /api/predict/steel endpoint is
unchanged per doc §10 rule 09.
"""

import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.enhanced_steel import EnhancedSteelInput, EnhancedSteelPrediction
from app.services.enhanced_steel_service import run_enhanced_steel_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/enhanced-steel",
    response_model=EnhancedSteelPrediction,
    summary="Predict all steel properties — Enhanced six-module engine",
    description=(
        "Unified six-module prediction engine for steel alloys. "
        "Accepts 13 elemental composition inputs (wt%), repair cycle count, "
        "and target application. Returns: elastic moduli, thermal properties, "
        "pre/post-repair strength, multi-cycle degradation profile, "
        "use suitability verdict, nearest grade recommendation, and cost estimate.\n\n"
        "**Endpoint path**: `/api/predict/enhanced-steel` (kebab-case, additive — "
        "existing `/api/predict/steel` is unchanged).\n\n"
        "**repair_cycles**: integer 0–10 (validated by Pydantic `ge=0, le=10`)."
    ),
)
async def predict_enhanced_steel_endpoint(
    input_data: EnhancedSteelInput,
    request: Request,
) -> EnhancedSteelPrediction:
    logger.info(
        "Enhanced steel prediction request: app=%s repairs=%d",
        input_data.application,
        input_data.repair_cycles,
    )

    try:
        result = run_enhanced_steel_prediction(
            models=request.app.state.models,
            input_data=input_data.model_dump(),
        )
        return result

    except ValueError as exc:
        logger.warning("Enhanced steel validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))

    except Exception as exc:
        logger.error("Unhandled error in /enhanced-steel: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Enhanced steel prediction failed. Check inputs and retry.",
        )
