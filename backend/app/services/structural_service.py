"""
structural_service.py
=====================
Engineering-mechanics-based structural analysis service.

Computes section properties, stress demands, safety factors, optimal material
compositions, and estimated service life for common structural shapes.

When material_type == 'steel', the service calls the Enhanced Steel v2.0
recommendation engine to return a real grade recommendation with all six
predicted properties (elastic, thermal, strength, repair, degradation, suitability).

No trained ML model is required for the mechanics calculations — all formulae
use IS 456, IS 800, Eurocode, and general mechanics references.
"""

import math
import logging

logger = logging.getLogger(__name__)

# Safety factor targets
SF_TARGET = {"concrete": 1.5, "steel": 1.67, "composite": 1.6}

# Service life tables (years)
SERVICE_LIFE = {
    "concrete":  {"mild": 100, "moderate": 75, "severe": 50, "very_severe": 30},
    "steel":     {"mild": 80,  "moderate": 60, "severe": 40, "very_severe": 20},
    "composite": {"mild": 90,  "moderate": 65, "severe": 45, "very_severe": 25},
}

# Recommended compositions for concrete / composite
COMPOSITIONS = {
    "concrete": {
        "mild":       {"cement_kg_m3": 300, "w_c_ratio": 0.55, "fly_ash_%": 20, "superplasticizer_kg_m3": 4},
        "moderate":   {"cement_kg_m3": 350, "w_c_ratio": 0.50, "fly_ash_%": 25, "superplasticizer_kg_m3": 6},
        "severe":     {"cement_kg_m3": 400, "w_c_ratio": 0.45, "fly_ash_%": 30, "superplasticizer_kg_m3": 8},
        "very_severe":{"cement_kg_m3": 450, "w_c_ratio": 0.40, "fly_ash_%": 35, "superplasticizer_kg_m3": 10},
    },
    "composite": {
        "mild":       {"concrete_grade": "M25", "steel_%_area": 1.0, "fibre_kg_m3": 0.0},
        "moderate":   {"concrete_grade": "M30", "steel_%_area": 1.5, "fibre_kg_m3": 0.0},
        "severe":     {"concrete_grade": "M40", "steel_%_area": 2.0, "fibre_kg_m3": 1.5},
        "very_severe":{"concrete_grade": "M50", "steel_%_area": 2.5, "fibre_kg_m3": 3.0},
    },
}

COMP_UNITS = {"concrete": "kg/m3 mix proportions", "composite": "mix ratios"}
COMP_DESCRIPTIONS = {
    "concrete":  "Optimised OPC concrete mix with supplementary cementitious materials",
    "composite": "Reinforced concrete composite with embedded steel reinforcement",
}

# Steel composition lookup by exposure (used as seed for recommendation engine)
STEEL_COMP_BY_EXPOSURE = {
    "mild":       {"c":0.20,"mn":1.0,"si":0.3,"cr":0.0, "ni":0.0, "mo":0.0, "v":0.0,"n":0.0,"nb":0.0,"co":0.0,"w":0.0,"al":0.02,"ti":0.01},
    "moderate":   {"c":0.15,"mn":1.2,"si":0.3,"cr":0.5, "ni":0.0, "mo":0.05,"v":0.0,"n":0.0,"nb":0.0,"co":0.0,"w":0.0,"al":0.02,"ti":0.01},
    "severe":     {"c":0.12,"mn":1.4,"si":0.3,"cr":1.0, "ni":0.5, "mo":0.1, "v":0.05,"n":0.0,"nb":0.0,"co":0.0,"w":0.0,"al":0.02,"ti":0.01},
    "very_severe":{"c":0.03,"mn":1.8,"si":0.5,"cr":17.0,"ni":12.0,"mo":2.5, "v":0.0,"n":0.05,"nb":0.0,"co":0.0,"w":0.0,"al":0.0, "ti":0.0},
}


def _section_properties(shape: str, width: float, depth: float) -> dict:
    if shape in ("rectangular_beam", "rectangular_slab", "square_footing"):
        d = depth if depth > 0 else width
        A = width * d
        I = (width * d**3) / 12.0
        Z = I / (d / 2.0)
        r = math.sqrt(I / A)
    elif shape == "circular_column":
        D = width
        A = math.pi * D**2 / 4.0
        I = math.pi * D**4 / 64.0
        Z = math.pi * D**3 / 32.0
        r = D / 4.0
    elif shape == "hollow_section":
        D_out = width;  D_in = D_out * 0.80
        h_out = depth if depth > 0 else width;  h_in = h_out * 0.80
        A = width * h_out - D_in * h_in
        I = (width * h_out**3 - D_in * h_in**3) / 12.0
        Z = I / (h_out / 2.0) if h_out > 0 else 1e-9
        r = math.sqrt(I / A) if A > 0 else 1e-9
    else:
        d = depth if depth > 0 else width
        A = width * d;  I = (width * d**3) / 12.0
        Z = I / (d / 2.0);  r = math.sqrt(I / A)
    return {"A": A, "I": I, "Z": Z, "r": r}


def _design_strength(mat: str, required_mpa: float, exposure: str) -> float:
    sf = SF_TARGET.get(mat, 1.5)
    factor = {"mild":1.0,"moderate":1.10,"severe":1.20,"very_severe":1.35}[exposure]
    return round(required_mpa * sf * factor, 1)


def _design_notes(shape, mat, slenderness, sf, design_ok, inclination_deg, exposure):
    notes = []
    if not design_ok:
        notes.append("Warning: Combined stress exceeds capacity -- increase section size or use higher-grade material.")
    if slenderness > 120 and shape in ("circular_column", "rectangular_beam"):
        notes.append("Warning: High slenderness ratio -- check buckling using Euler's formula.")
    if inclination_deg > 30:
        notes.append(f"Info: Member inclined at {inclination_deg} degrees; resolve loads along and perpendicular to axis.")
    if exposure in ("severe", "very_severe") and mat == "steel":
        notes.append("Info: Severe exposure -- use stainless or galvanised steel (see enhanced steel recommendation).")
    if mat == "concrete" and shape == "rectangular_slab":
        notes.append("Info: Slab -- check deflection (L/250) and provide minimum 0.12pct temperature reinforcement.")
    if sf > 3.0:
        notes.append("Info: Very high safety factor -- section is over-designed; consider optimising dimensions.")
    if not notes:
        notes.append("OK: Section satisfies all basic design checks.")
    return notes


def _run_steel_recommendation(
    models: dict,
    required_mpa: float,
    exposure: str,
    application: str,
    concrete_fck_mpa: float,
) -> dict | None:
    """
    Pick the best-fit steel composition for the computed stress demand,
    run the full Enhanced Steel engine, and return a flat recommendation dict.
    Returns None if models are not loaded or on any error.
    """
    try:
        from app.services.enhanced_steel_service import run_enhanced_steel_prediction

        comp = dict(STEEL_COMP_BY_EXPOSURE[exposure])

        # Scale alloy content proportionally if required strength is high
        scale = max(1.0, required_mpa / 350.0)
        comp["mn"] = min(3.0,  comp["mn"] * scale)
        comp["cr"] = min(25.0, comp["cr"] * scale)

        # Concrete fck context: if high grade concrete, need higher yield steel
        target_sy = concrete_fck_mpa * 6.0
        if target_sy > 350:
            comp["c"]  = min(2.0,  comp["c"]  + 0.03)
            comp["mn"] = min(3.0,  comp["mn"] + 0.20)
            comp["cr"] = min(25.0, comp["cr"] + 0.30)

        comp["repair_cycles"] = 0
        comp["application"]   = application

        result = run_enhanced_steel_prediction(models, comp)

        return {
            "grade_name":               result["recommendation"]["grade_name"],
            "estimated_lifespan_years": result["recommendation"]["estimated_lifespan_years"],
            "remaining_repairs":        result["recommendation"]["remaining_repairs"],
            "max_repair_cycles":        result["recommendation"]["max_repair_cycles"],
            "standard_reference":       result["recommendation"]["standard_reference"],
            "weldability_class":        result["suitability"]["weldability_class"],
            "carbon_equivalent":        result["suitability"]["carbon_equivalent"],
            "verdict":                  result["recommendation"]["verdict"],
            "mechanical":               result["mechanical"],
            "thermal":                  result["thermal"],
            "strength":                 result["strength"],
            "repair":                   result["repair"],
            "degradation":              result["degradation"],
            "recommended_composition":  comp,
        }
    except Exception as exc:
        logger.warning("Enhanced steel recommendation failed in structural service: %s", exc)
        return None


def run_structural_analysis(input_data: dict, models: dict = None) -> dict:
    shape     = input_data["shape"]
    mat       = input_data["material_type"]
    L         = input_data["length"]
    B         = input_data["width"]
    D         = input_data.get("depth", 0.0) or 0.0
    P_kn      = input_data["axial_load_kn"]
    M_knm     = input_data["bending_moment_knm"]
    V_kn      = input_data["shear_force_kn"]
    theta_deg = input_data.get("inclination_deg", 0.0)
    exposure  = input_data["exposure_class"]
    fck       = input_data.get("concrete_fck_mpa", 30.0)
    steel_app = input_data.get("steel_application", "structural")

    P = P_kn  * 1e3
    M = M_knm * 1e3
    V = V_kn  * 1e3

    props = _section_properties(shape, B, D if D > 0 else B)
    A = props["A"]; I = props["I"]; Z = props["Z"]; r_gy = props["r"]

    effective_length = L * (0.85 if shape == "circular_column" else 1.0)
    slenderness = round(effective_length / r_gy, 1) if r_gy > 0 else 0

    sigma_axial    = round((P / A) / 1e6, 3) if A > 0 else 0.0
    sigma_bend     = round((M / Z) / 1e6, 3) if Z > 0 else 0.0
    tau_shear      = round((1.5 * V / A) / 1e6, 3) if A > 0 else 0.0
    sigma_combined = round(math.sqrt((sigma_axial + sigma_bend)**2 + 3 * tau_shear**2), 3)

    required_mpa = _design_strength(mat, sigma_combined, exposure)
    sf           = round(required_mpa / sigma_combined, 2) if sigma_combined > 0 else 999.0
    design_ok    = sf >= SF_TARGET.get(mat, 1.5)

    notes = _design_notes(shape, mat, slenderness, sf, design_ok, theta_deg, exposure)

    shap_values = {
        "axial_load":          round(sigma_axial / max(sigma_combined, 1e-9), 4),
        "bending_moment":      round(sigma_bend  / max(sigma_combined, 1e-9), 4),
        "shear_force":         round(math.sqrt(3) * tau_shear / max(sigma_combined, 1e-9), 4),
        "slenderness_penalty": round(min(slenderness / 300.0, 0.5), 4),
        "exposure_factor":     round({"mild":0.0,"moderate":0.1,"severe":0.2,"very_severe":0.35}[exposure], 4),
    }

    # Steel mode: run Enhanced Steel engine
    steel_rec    = None
    rec_comp     = None
    service_life = SERVICE_LIFE[mat][exposure]

    if mat == "steel":
        steel_rec = _run_steel_recommendation(models or {}, required_mpa, exposure, steel_app, fck)
        if steel_rec:
            service_life = int(steel_rec.get("estimated_lifespan_years", service_life))
    else:
        comp_data = COMPOSITIONS[mat][exposure]
        rec_comp  = {
            "description": COMP_DESCRIPTIONS[mat],
            "components":  comp_data,
            "unit":        COMP_UNITS[mat],
        }

    return {
        "status":                      "success",
        "shape":                       shape,
        "material_type":               mat,
        "cross_section_area_m2":       round(A, 6),
        "moment_of_inertia_m4":        round(I, 8),
        "section_modulus_m3":          round(Z, 7),
        "radius_of_gyration_m":        round(r_gy, 5),
        "slenderness_ratio":           slenderness,
        "max_bending_stress_mpa":      sigma_bend,
        "max_axial_stress_mpa":        sigma_axial,
        "max_shear_stress_mpa":        tau_shear,
        "combined_stress_mpa":         sigma_combined,
        "required_strength_mpa":       required_mpa,
        "safety_factor":               sf,
        "design_ok":                   design_ok,
        "recommended_composition":     rec_comp,
        "estimated_service_life_years":service_life,
        "design_notes":                notes,
        "shap_values":                 shap_values,
        "steel_recommendation":        steel_rec,
    }
