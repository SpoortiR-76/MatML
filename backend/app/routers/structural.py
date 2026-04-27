import logging
from fastapi import APIRouter, HTTPException, Request
from app.schemas.structural import StructuralInput, StructuralPrediction
from app.services.structural_service import run_structural_analysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/structural",
    response_model=StructuralPrediction,
    summary="Structural analysis — section design & material optimisation",
)
async def predict_structural(input_data: StructuralInput, request: Request):
    """
    Analyse a structural member and recommend the optimal material composition.

    When **material_type = steel**, the Enhanced Steel v2.0 engine is called
    to return a real grade recommendation with elastic, thermal, pre/post-repair
    strength, degradation profile, and weldability class — all based on the
    computed combined stress demand and selected exposure class.

    - **shape**: beam, column, slab, footing, or hollow section
    - **material_type**: concrete, steel, or composite
    - **dimensions**: length, width, depth (m)
    - **loads**: axial (kN), bending (kN·m), shear (kN)
    - **inclination_deg**: member tilt from horizontal (degrees)
    - **exposure_class**: environmental aggressiveness (mild to very_severe)
    - **concrete_fck_mpa**: concrete grade (for steel reinforcement sizing)
    - **steel_application**: target application (structural, bridge, offshore, etc.)
    """
    logger.info("Structural analysis request: %s", input_data.model_dump())
    try:
        models = getattr(request.app.state, "models", {})
        result = run_structural_analysis(input_data.model_dump(), models=models)
        return result
    except ValueError as exc:
        logger.warning("Structural validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Unhandled error in /structural: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Structural analysis failed. Please check inputs.")

