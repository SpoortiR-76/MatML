"""
Enhanced Steel ML inference functions — v2.0
============================================
One function per module + SHAP helper that works with multi-output models.
All functions follow doc §10 rule 04: model and scaler are always paired.
"""

import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Canonical feature order — must match train_enhanced_steel.py INPUT_COMP
ENHANCED_STEEL_FEATURES = [
    "c", "mn", "si", "cr", "ni", "mo", "v", "n", "nb", "co", "w", "al", "ti",
]
DECAY_K = 0.07


# ── SHAP helper ─────────────────────────────────────────────────────────────
def _shap_for_module(model: Any, X_scaled: np.ndarray, top_n: int = 5) -> dict[str, float]:
    """
    Compute SHAP values with TreeExplainer.
    For MultiOutputRegressor, uses the first estimator.
    Returns {feature: shap_value} for top_n features by |value|.
    Falls back to empty dict on any failure (doc §10 rule 08 — best-effort).
    """
    try:
        import shap  # lazy import

        base = getattr(model, "estimators_", None)
        target_model = base[0] if base is not None else model

        explainer = shap.TreeExplainer(target_model)
        sv = explainer.shap_values(X_scaled, check_additivity=False)

        if isinstance(sv, list):
            sv = sv[1] if len(sv) > 1 else sv[0]
        if hasattr(sv, "ndim") and sv.ndim > 1:
            sv = sv[0]

        pairs = sorted(
            zip(ENHANCED_STEEL_FEATURES, sv.tolist()),
            key=lambda x: abs(x[1]),
            reverse=True,
        )
        return {k: round(v, 4) for k, v in pairs[:top_n]}

    except Exception as exc:
        logger.warning("SHAP failed for enhanced steel module: %s", exc)
        return {}


def _make_input(input_data: dict) -> tuple[np.ndarray, pd.DataFrame]:
    """Build feature array from input dict. Returns (ndarray, DataFrame)."""
    row = {f: input_data.get(f, 0.0) for f in ENHANCED_STEEL_FEATURES}
    df  = pd.DataFrame([row], columns=ENHANCED_STEEL_FEATURES)
    return df.values, df


# ── Carbon equivalent (deterministic, IIW formula) ──────────────────────────
def compute_ce(data: dict) -> float:
    """IIW carbon equivalent used by recommendation engine."""
    return (
        data.get("c", 0.0)
        + data.get("mn", 0.0) / 6
        + (data.get("cr", 0.0) + data.get("mo", 0.0) + data.get("v", 0.0)) / 5
        + (data.get("ni", 0.0) + data.get("co", 0.0)) / 15
    )


# ── Module A — Mechanical ────────────────────────────────────────────────────
def predict_mech(model: Any, scaler: Any, input_data: dict) -> dict:
    arr, _ = _make_input(input_data)
    sc      = scaler.transform(arr)
    preds   = model.predict(sc)[0]          # [E, G, mu]

    return {
        "E_mpa":  round(float(preds[0]), 2),
        "G_mpa":  round(float(preds[1]), 2),
        "mu":     round(float(preds[2]), 4),
        "shap_values": _shap_for_module(model, sc),
    }


# ── Module B — Thermal / EM ──────────────────────────────────────────────────
def predict_thermal(model: Any, scaler: Any, input_data: dict) -> dict:
    arr, _ = _make_input(input_data)
    sc      = scaler.transform(arr)
    preds   = model.predict(sc)[0]          # [conductivity, Tc, Ro]

    return {
        "thermal_conductivity_W_mK": round(float(preds[0]), 3),
        "critical_temperature_C":    round(float(preds[1]), 1),
        "density_kg_m3":             round(float(preds[2]), 1),
        "shap_values": _shap_for_module(model, sc),
    }


# ── Module C — Strength (pre-repair) ────────────────────────────────────────
def predict_strength(model: Any, scaler: Any, input_data: dict) -> dict:
    arr, _ = _make_input(input_data)
    sc      = scaler.transform(arr)
    preds   = model.predict(sc)[0]          # [su, sy, elongation]

    return {
        "su_mpa":         round(float(preds[0]), 2),
        "sy_mpa":         round(float(preds[1]), 2),
        "elongation_pct": round(float(preds[2]), 2),
        "shap_values": _shap_for_module(model, sc),
    }


# ── Module D — Post-repair strength ─────────────────────────────────────────
def predict_repair(
    model: Any,
    scaler: Any,                # shared strength scaler
    input_data: dict,
    su_original: float,
    sy_original: float,
) -> dict:
    arr, _ = _make_input(input_data)
    sc      = scaler.transform(arr)
    preds   = model.predict(sc)[0]          # [su_post, sy_post]

    su_post = round(float(preds[0]), 2)
    sy_post = round(float(preds[1]), 2)
    rf      = round(sy_post / sy_original, 4) if sy_original > 0 else 0.0

    return {
        "su_post_mpa":  su_post,
        "sy_post_mpa":  sy_post,
        "repair_factor": rf,
        "shap_values": _shap_for_module(model, sc),
    }


# ── Module E — Repair degradation ───────────────────────────────────────────
def predict_degrade(
    model: Any,
    scaler: Any,
    input_data: dict,
    repair_cycles: int,
) -> dict:
    arr, _ = _make_input(input_data)
    sc      = scaler.transform(arr)
    lifespan_index = round(float(model.predict(sc)[0]), 4)

    # Deterministic residual at current cycle count (exponential decay)
    residual_ratio = round(float(np.exp(-DECAY_K * repair_cycles)), 4)
    residual_ratio = max(0.05, min(1.0, residual_ratio))

    # Cycles until residual drops below 0.70 threshold
    threshold = 0.70
    n_threshold = 0
    for n in range(1, 11):
        r = float(np.exp(-DECAY_K * n))
        if r < threshold:
            n_threshold = n
            break
    if n_threshold == 0:
        n_threshold = 10   # still above threshold at max cycles

    return {
        "lifespan_index":          lifespan_index,
        "residual_strength_ratio": residual_ratio,
        "cycles_to_threshold":     n_threshold,
        "shap_values": _shap_for_module(model, sc),
    }


# ── Module F — Use suitability ───────────────────────────────────────────────
def predict_use(
    use_model:  Any,
    scaler:     Any,
    input_data: dict,
) -> dict:
    arr, _ = _make_input(input_data)

    # Use suitability
    sc_use  = scaler.transform(arr)
    rec     = bool(use_model.predict(sc_use)[0])
    prob    = float(use_model.predict_proba(sc_use)[0][1])

    # Weldability class (deterministic CE bracket per implementation plan)
    ce = compute_ce(input_data)
    if ce < 0.35:
        weld_cls = 2
    elif ce < 0.45:
        weld_cls = 1
    else:
        weld_cls = 0

    class_labels = {
        0: ("Class III", "Poor weldability — mandatory preheat required (CE ≥ 0.45)"),
        1: ("Class II",  "Acceptable weldability — limited preheat advisable (0.35 ≤ CE < 0.45)"),
        2: ("Class I",   "Excellent weldability — no preheat needed (CE < 0.35)"),
    }
    cls_name, cls_label = class_labels.get(weld_cls, ("Unknown", "Weldability undetermined"))

    return {
        "recommended":         rec,
        "recommendation_prob": round(prob, 4),
        "weldability_class":   cls_name,
        "weldability_label":   cls_label,
        "carbon_equivalent":   round(ce, 4),
        "shap_values": _shap_for_module(use_model, sc_use),
    }


# ── Deterministic recommendation engine (§10 rule 11) ───────────────────────
APPLICATION_TABLE = {
    "structural":         {"base_years": 50, "max_repairs": 8,  "standard": "BS EN 1993"},
    "bridge":             {"base_years": 40, "max_repairs": 6,  "standard": "BS 5400"},
    "pressure_vessel":    {"base_years": 30, "max_repairs": 4,  "standard": "ASME VIII"},
    "pipeline":           {"base_years": 35, "max_repairs": 5,  "standard": "ASME B31.3"},
    "offshore":           {"base_years": 25, "max_repairs": 4,  "standard": "DNV-OS-C101"},
    "rotating_machinery": {"base_years": 20, "max_repairs": 3,  "standard": "ISO 9283"},
}

# Nearest grade lookup by CE + Cr content
GRADE_LOOKUP = [
    # (CE_max, Cr_min, Cr_max, grade_name)
    (0.20, 0.0,  0.0,  "Low-Carbon Structural (S235 / ASTM A36)"),
    (0.30, 0.0,  2.0,  "Carbon Manganese (S355 / ASTM A572)"),
    (0.35, 2.0,  6.0,  "Low-Alloy High-Strength (HSLA 60)"),
    (0.40, 0.0,  2.0,  "Medium-Carbon Alloy (4140 / EN 19)"),
    (0.40, 6.0,  13.0, "Martensitic Stainless (410 / 420 SS)"),
    (0.45, 0.0,  2.0,  "Weld-Critical Structural (S460 / ASTM A913)"),
    (0.50, 10.0, 30.0, "Austenitic Stainless (304 / 316 SS)"),
    (1.00, 0.0,  30.0, "High-Alloy / Tool Steel (H13 / D2)"),
]


def _nearest_grade(ce: float, cr: float) -> str:
    for ce_max, cr_min, cr_max, name in GRADE_LOOKUP:
        if ce <= ce_max and cr_min <= cr <= cr_max:
            return name
    return "High-Alloy Specialty Steel"


def run_recommendation_engine(
    input_data: dict,
    lifespan_index: float,
    recommended: bool,
    weldability_class: str,
    repair_cycles: int,
    application: str,
) -> dict:
    """
    Pure rule-based recommendation engine (no ML model).
    Returns grade name, lifespan estimate, remaining repairs, verdict.
    Doc §10 rule 11: deterministic, CE threshold + lookup arithmetic.
    """
    app_info = APPLICATION_TABLE.get(application, APPLICATION_TABLE["structural"])
    base_years   = app_info["base_years"]
    max_repairs  = app_info["max_repairs"]
    standard     = app_info["standard"]

    ce         = compute_ce(input_data)
    cr         = input_data.get("cr", 0.0)
    grade_name = _nearest_grade(ce, cr)

    # Lifespan = base × lifespan_index (0–1), rounded to nearest year
    estimated_years = round(base_years * lifespan_index, 1)
    remaining       = max(0, max_repairs - repair_cycles)

    # Verdict paragraph
    if recommended and weldability_class in ("Class I", "Class II"):
        verdict_parts = [
            f"Grade match: {grade_name}.",
            f"Suitable for {application.replace('_', ' ')} applications per {standard}.",
            f"Estimated service life: {estimated_years:.0f} years.",
            f"Up to {remaining} further repair cycle(s) within safe limits.",
            f"Weldability: {weldability_class} — minimal preheat concerns.",
        ]
    elif recommended:
        verdict_parts = [
            f"Grade match: {grade_name}.",
            f"Conditionally suitable for {application.replace('_', ' ')} ({standard}).",
            f"CE = {ce:.3f} — Class III weldability: mandatory preheat protocol required.",
            f"Estimated service life: {estimated_years:.0f} years.",
            f"{remaining} permitted repair cycle(s) remaining.",
        ]
    else:
        verdict_parts = [
            f"Grade match: {grade_name}.",
            f"NOT recommended for {application.replace('_', ' ')} applications.",
            f"CE = {ce:.3f} exceeds structural weldability limit.",
            f"Consider lower-CE alternatives or confirm application with Materials Engineer.",
            f"Estimated service life (indicative only): {estimated_years:.0f} years.",
        ]

    return {
        "grade_name":               grade_name,
        "application":              application.replace("_", " ").title(),
        "estimated_lifespan_years": estimated_years,
        "max_repair_cycles":        max_repairs,
        "standard_reference":       standard,
        "verdict":                  " ".join(verdict_parts),
        "remaining_repairs":        remaining,
    }
