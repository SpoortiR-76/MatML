"""
Enhanced Steel Service — orchestration layer
============================================
Wires together the six inference modules, recommendation engine, and
cost_service thin wrapper. Falls back to a mock response when model
files are absent (doc §10 rule — mock must return full six-module schema).
"""

import logging

from app.ml.enhanced_steel_inference import (
    predict_degrade,
    predict_mech,
    predict_repair,
    predict_strength,
    predict_thermal,
    predict_use,
    run_recommendation_engine,
)

logger = logging.getLogger(__name__)

MODEL_LABEL = "Enhanced-Steel-v2.0 (MultiOutput RF/XGB)"

# ── Mock response  — full six-module schema, always valid ────────────────────
_MOCK = {
    "status":     "success (mock — models not loaded)",
    "model_used": "MOCK",
    "mechanical": {
        "E_mpa": 207_000.0, "G_mpa": 80_000.0, "mu": 0.29, "shap_values": {},
    },
    "thermal": {
        "thermal_conductivity_W_mK": 45.0,
        "critical_temperature_C":   650.0,
        "density_kg_m3":            7850.0,
        "shap_values": {},
    },
    "strength": {
        "su_mpa": 550.0, "sy_mpa": 400.0, "elongation_pct": 22.0, "shap_values": {},
    },
    "repair": {
        "su_post_mpa": 506.0, "sy_post_mpa": 368.0, "repair_factor": 0.92, "shap_values": {},
    },
    "degradation": {
        "lifespan_index": 0.82,
        "residual_strength_ratio": 0.92,
        "cycles_to_threshold": 7,
        "shap_values": {},
    },
    "suitability": {
        "recommended":         True,
        "recommendation_prob": 0.87,
        "weldability_class":   "Class II",
        "weldability_label":   "Acceptable weldability — limited preheat advisable",
        "carbon_equivalent":   0.38,
        "shap_values": {},
    },
    "recommendation": {
        "grade_name":               "Carbon Manganese (S355 / ASTM A572)",
        "application":              "Structural",
        "estimated_lifespan_years": 41.0,
        "max_repair_cycles":        8,
        "standard_reference":       "BS EN 1993",
        "verdict":                  "Mock response — train models to get a real prediction.",
        "remaining_repairs":        8,
    },
}


def run_enhanced_steel_prediction(models: dict, input_data: dict) -> dict:
    """
    Orchestrate all six module predictions + recommendation + cost.
    Falls back to mock when any required model is missing.
    """
    required_keys = [
        "enhanced_mech_model",    "enhanced_mech_scaler",
        "enhanced_thermal_model", "enhanced_thermal_scaler",
        "enhanced_strength_model","enhanced_strength_scaler",
        "enhanced_repair_model",
        "enhanced_degrade_model",
        "enhanced_use_model",
    ]

    if any(models.get(k) is None for k in required_keys):
        missing = [k for k in required_keys if models.get(k) is None]
        logger.warning(
            "Enhanced steel models not fully loaded (%s) — returning mock response", missing
        )
        return _MOCK

    repair_cycles = int(input_data.get("repair_cycles", 0))
    application   = str(input_data.get("application", "structural"))

    try:
        # Module A — Mechanical
        mech = predict_mech(
            models["enhanced_mech_model"],
            models["enhanced_mech_scaler"],
            input_data,
        )

        # Module B — Thermal
        thermal = predict_thermal(
            models["enhanced_thermal_model"],
            models["enhanced_thermal_scaler"],
            input_data,
        )

        # Module C — Pre-repair strength
        strength = predict_strength(
            models["enhanced_strength_model"],
            models["enhanced_strength_scaler"],
            input_data,
        )

        # Module D — Post-repair strength (shared strength scaler)
        repair = predict_repair(
            models["enhanced_repair_model"],
            models["enhanced_strength_scaler"],
            input_data,
            su_original=strength["su_mpa"],
            sy_original=strength["sy_mpa"],
        )

        # Module E — Degradation (shared strength scaler)
        degradation = predict_degrade(
            models["enhanced_degrade_model"],
            models["enhanced_strength_scaler"],
            input_data,
            repair_cycles=repair_cycles,
        )

        # Module F — Use suitability + weldability class
        suitability = predict_use(
            models["enhanced_use_model"],
            models["enhanced_strength_scaler"],  # shared
            input_data,
        )

        # Recommendation engine (deterministic)
        recommendation = run_recommendation_engine(
            input_data      = input_data,
            lifespan_index  = degradation["lifespan_index"],
            recommended     = suitability["recommended"],
            weldability_class = suitability["weldability_class"],
            repair_cycles   = repair_cycles,
            application     = application,
        )

        return {
            "status":         "success",
            "model_used":     MODEL_LABEL,
            "mechanical":     mech,
            "thermal":        thermal,
            "strength":       strength,
            "repair":         repair,
            "degradation":    degradation,
            "suitability":    suitability,
            "recommendation": recommendation,
        }

    except Exception as exc:
        logger.error("Enhanced steel prediction failed: %s", exc, exc_info=True)
        raise
