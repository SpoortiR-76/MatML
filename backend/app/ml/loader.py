import logging
import os

import joblib

from app.config import settings

logger = logging.getLogger(__name__)


def load_all_models() -> dict:
    """
    Load every model and scaler from the trained_models directory.
    If a file is missing, stores None and logs a warning (mock mode).
    Returns a dict used in app.state.models.
    """
    models: dict = {}
    model_dir = settings.MODEL_DIR

    required_files = {
        # ── Existing models (unchanged) ────────────────────────────────────
        "concrete_model":        "concrete_best_model.pkl",
        "concrete_scaler":       "concrete_scaler.pkl",
        "steel_model":           "steel_best_model.pkl",
        "steel_scaler":          "steel_scaler.pkl",
        "materials_reg_model":   "materials_reg_model.pkl",
        "materials_cls_model":   "materials_cls_model.pkl",
        "materials_scaler":      "materials_scaler.pkl",

        # ── Enhanced Steel v2.0 — six-module engine ────────────────────────
        # Module A — Mechanical
        "enhanced_mech_model":     "enhanced_steel_mech_model.pkl",
        "enhanced_mech_scaler":    "enhanced_steel_mech_scaler.pkl",
        # Module B — Thermal / EM
        "enhanced_thermal_model":  "enhanced_steel_thermal_model.pkl",
        "enhanced_thermal_scaler": "enhanced_steel_thermal_scaler.pkl",
        # Module C — Strength (pre-repair) — scaler shared by D / E / F
        "enhanced_strength_model":  "enhanced_steel_strength_model.pkl",
        "enhanced_strength_scaler": "enhanced_steel_strength_scaler.pkl",
        # Module D — Post-repair strength (reuses strength scaler)
        "enhanced_repair_model":   "enhanced_steel_repair_model.pkl",
        # Module E — Repair degradation (reuses strength scaler)
        "enhanced_degrade_model":  "enhanced_steel_degrade_model.pkl",
        # Module F — Use suitability (reuses strength scaler)
        "enhanced_use_model":      "enhanced_steel_use_model.pkl",
    }

    for key, filename in required_files.items():
        path = os.path.join(model_dir, filename)
        if os.path.exists(path):
            try:
                models[key] = joblib.load(path)
                logger.info("Loaded model artifact: %s", filename)
            except Exception as exc:
                logger.error("Failed to load %s: %s", filename, exc)
                models[key] = None
        else:
            logger.warning("Missing model file: %s — running in MOCK mode for '%s'", filename, key)
            models[key] = None

    loaded = [k for k, v in models.items() if v is not None]
    missing = [k for k, v in models.items() if v is None]
    logger.info("Models ready: %s", loaded)
    if missing:
        logger.warning("Models in MOCK mode: %s", missing)

    return models
