import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ── Feature order must exactly match training ──────────────────────────────
CONCRETE_FEATURE_MAP = {
    "cement": "Cement (component 1)(kg in a m^3 mixture)",
    "blast_furnace_slag": "Blast Furnace Slag (component 2)(kg in a m^3 mixture)",
    "fly_ash": "Fly Ash (component 3)(kg in a m^3 mixture)",
    "water": "Water  (component 4)(kg in a m^3 mixture)",
    "superplasticizer": "Superplasticizer (component 5)(kg in a m^3 mixture)",
    "coarse_aggregate": "Coarse Aggregate  (component 6)(kg in a m^3 mixture)",
    "fine_aggregate": "Fine Aggregate (component 7)(kg in a m^3 mixture)",
    "age": "Age (day)"
}

STEEL_FEATURE_ORDER = [
    "c", "mn", "si", "cr", "ni", "mo", "v", "n", "nb", "co", "w", "al", "ti",
]

MATERIALS_FEATURE_ORDER = ["E", "G", "mu", "Ro"]


# ── SHAP helper ────────────────────────────────────────────────────────────
def get_shap_values(model: Any, X_scaled: np.ndarray, feature_names: list, top_n: int = 5) -> dict:
    """
    Compute SHAP values using TreeExplainer.
    Returns a dict of {feature: shap_value} for the top_n features by absolute magnitude.
    Falls back to an empty dict on any failure (model may not support TreeExplainer).
    """
    try:
        import shap  # lazy import — keeps startup fast when shap isn't installed

        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_scaled, check_additivity=False)

        # Binary classification → class 1 values
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]

        # Take first sample if 2-D
        if hasattr(shap_vals, 'ndim') and shap_vals.ndim > 1:
            shap_vals = shap_vals[0]

        pairs = sorted(
            zip(feature_names, shap_vals.tolist()),
            key=lambda x: abs(x[1]),
            reverse=True,
        )
        return {k: round(v, 4) for k, v in pairs[:top_n]}

    except Exception as exc:
        logger.warning("SHAP computation failed: %s", exc)
        return {}



# ── Concrete ───────────────────────────────────────────────────────────────
def predict_concrete(model: Any, scaler: Any, input_data: dict) -> dict:
    mapped_data = {CONCRETE_FEATURE_MAP[k]: input_data[k] for k in CONCRETE_FEATURE_MAP}
    feature_names_long = list(CONCRETE_FEATURE_MAP.values())
    X = pd.DataFrame([mapped_data], columns=feature_names_long)
    # Use .values to avoid sklearn feature-name mismatch when scaler was fitted on ndarray
    X_scaled_arr = scaler.transform(X)
    # Reconstruct DataFrame so model.predict() receives named columns (avoids UserWarning)
    X_scaled = pd.DataFrame(X_scaled_arr, columns=feature_names_long)
    prediction = float(model.predict(X_scaled)[0])
    
    # feature_names passed to SHAP will also use the long names to prevent mismatches
    shap_vals_long = get_shap_values(model, X_scaled_arr, feature_names_long)
    
    # Option: map SHAP keys back to short names for frontend compatibility
    # e.g. "Cement (..)" -> "cement"
    reverse_map = {v: k for k, v in CONCRETE_FEATURE_MAP.items()}
    shap_vals = {reverse_map.get(k, k): v for k, v in shap_vals_long.items()}

    return {
        "predicted_compressive_strength_mpa": round(prediction, 2),
        "shap_values": shap_vals,
    }


# ── Steel ──────────────────────────────────────────────────────────────────
def predict_steel(model: Any, scaler: Any, input_data: dict) -> dict:
    X = pd.DataFrame([{k: input_data[k] for k in STEEL_FEATURE_ORDER}], columns=STEEL_FEATURE_ORDER)
    X_scaled_arr = scaler.transform(X)
    X_scaled = pd.DataFrame(X_scaled_arr, columns=STEEL_FEATURE_ORDER)
    predictions = model.predict(X_scaled)[0]

    # SHAP on the first estimator of MultiOutputRegressor
    base_estimator = getattr(model, "estimators_", [None])[0]
    shap_vals = {}
    if base_estimator is not None:
        shap_vals = get_shap_values(base_estimator, X_scaled_arr, STEEL_FEATURE_ORDER)

    return {
        "predicted_yield_strength_mpa": round(float(predictions[0]), 2),
        "predicted_tensile_strength_mpa": round(float(predictions[1]), 2),
        "predicted_elongation_percent": round(float(predictions[2]), 2),
        "shap_values": shap_vals,
    }


# ── Materials ──────────────────────────────────────────────────────────────
def predict_materials(
    reg_model: Any, cls_model: Any, scaler: Any, input_data: dict
) -> dict:
    X = pd.DataFrame([{k: input_data[k] for k in MATERIALS_FEATURE_ORDER}], columns=MATERIALS_FEATURE_ORDER)
    X_scaled_arr = scaler.transform(X)
    X_scaled = pd.DataFrame(X_scaled_arr, columns=MATERIALS_FEATURE_ORDER)

    # Regression: [Su, Sy]
    reg_preds = reg_model.predict(X_scaled)[0]

    # Classification: Use (bool) + probability
    cls_pred = bool(cls_model.predict(X_scaled)[0])
    cls_prob = float(cls_model.predict_proba(X_scaled)[0][1])

    # SHAP from first estimator of MultiOutputRegressor
    base_estimator = getattr(reg_model, "estimators_", [None])[0]
    shap_vals = {}
    if base_estimator is not None:
        shap_vals = get_shap_values(base_estimator, X_scaled_arr, MATERIALS_FEATURE_ORDER)

    return {
        "predicted_Su_mpa": round(float(reg_preds[0]), 2),
        "predicted_Sy_mpa": round(float(reg_preds[1]), 2),
        "predicted_use": cls_pred,
        "use_probability": round(cls_prob, 4),
        "shap_values": shap_vals,
    }
