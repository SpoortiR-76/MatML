"""
Enhanced Steel Pydantic schemas — v2.0
Covers the six-module unified prediction engine.
Endpoint: POST /api/predict/enhanced-steel
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


# ── Input ────────────────────────────────────────────────────────────────────
class EnhancedSteelInput(BaseModel):
    """
    13 elemental composition inputs (wt%) + operational context.
    All composition fields are optional except carbon (c).
    repair_cycles validated 0–10 per doc §10 rule 07.
    """
    # Composition
    c:   float = Field(..., ge=0, le=2.0,  description="Carbon wt%")
    mn:  float = Field(0.0, ge=0, le=3.0,  description="Manganese wt%")
    si:  float = Field(0.0, ge=0, le=2.0,  description="Silicon wt%")
    cr:  float = Field(0.0, ge=0, le=25.0, description="Chromium wt%")
    ni:  float = Field(0.0, ge=0, le=25.0, description="Nickel wt%")
    mo:  float = Field(0.0, ge=0, le=5.0,  description="Molybdenum wt%")
    v:   float = Field(0.0, ge=0, le=2.0,  description="Vanadium wt%")
    n:   float = Field(0.0, ge=0, le=0.5,  description="Nitrogen wt%")
    nb:  float = Field(0.0, ge=0, le=0.5,  description="Niobium wt%")
    co:  float = Field(0.0, ge=0, le=25.0, description="Cobalt wt%")
    w:   float = Field(0.0, ge=0, le=5.0,  description="Tungsten wt%")
    al:  float = Field(0.0, ge=0, le=2.0,  description="Aluminium wt%")
    ti:  float = Field(0.0, ge=0, le=2.0,  description="Titanium wt%")

    # Operational context
    repair_cycles: int = Field(
        0, ge=0, le=10,
        description="Number of repair (weld) cycles already performed (0–10)",
    )
    application: Literal[
        "structural", "bridge", "pressure_vessel", "pipeline", "offshore", "rotating_machinery"
    ] = Field("structural", description="Target application for the recommendation engine")

    model_config = {
        "json_schema_extra": {
            "example": {
                "c": 0.15, "mn": 1.20, "si": 0.30, "cr": 0.50,
                "ni": 0.40, "mo": 0.10, "v": 0.05, "n": 0.005,
                "nb": 0.02, "co": 0.0,  "w": 0.0,  "al": 0.02, "ti": 0.01,
                "repair_cycles": 0,
                "application": "structural",
            }
        }
    }


# ── Module output sub-models ─────────────────────────────────────────────────
class MechanicalProperties(BaseModel):
    """Module A outputs."""
    E_mpa:  float = Field(..., description="Young's modulus (MPa)")
    G_mpa:  float = Field(..., description="Shear modulus (MPa)")
    mu:     float = Field(..., description="Poisson's ratio")
    shap_values: dict[str, float] = {}


class ThermalProperties(BaseModel):
    """Module B outputs."""
    thermal_conductivity_W_mK: float = Field(..., description="Thermal conductivity (W/m·K)")
    critical_temperature_C:    float = Field(..., description="Maximum service temperature (°C)")
    density_kg_m3:             float = Field(..., description="Density (kg/m³)")
    shap_values: dict[str, float] = {}


class StrengthProperties(BaseModel):
    """Module C outputs — pre-repair."""
    su_mpa:          float = Field(..., description="Ultimate tensile strength (MPa)")
    sy_mpa:          float = Field(..., description="Yield strength (MPa)")
    elongation_pct:  float = Field(..., description="Elongation (%)")
    shap_values: dict[str, float] = {}


class RepairStrength(BaseModel):
    """Module D outputs — post one weld cycle."""
    su_post_mpa: float = Field(..., description="Post-repair ultimate tensile strength (MPa)")
    sy_post_mpa: float = Field(..., description="Post-repair yield strength (MPa)")
    repair_factor: float = Field(..., description="HAZ repair strength retention factor (0–1)")
    shap_values: dict[str, float] = {}


class DegradationProfile(BaseModel):
    """Module E outputs — multi-cycle residual strength."""
    lifespan_index:         float = Field(..., description="Composite lifespan index (0–1)")
    residual_strength_ratio: float = Field(..., description="Residual strength ratio at current repair count")
    cycles_to_threshold:    int   = Field(..., description="Estimated cycles before residual falls below 0.70")
    shap_values: dict[str, float] = {}


class SuitabilityVerdict(BaseModel):
    """Module F outputs — use suitability + weldability class."""
    recommended:          bool  = Field(..., description="True if structurally recommended")
    recommendation_prob:  float = Field(..., description="Recommendation probability (0–1)")
    weldability_class:    str   = Field(..., description="Weldability class: I / II / III")
    weldability_label:    str   = Field(..., description="Human-readable weldability description")
    carbon_equivalent:    float = Field(..., description="IIW carbon equivalent (CE)")
    shap_values: dict[str, float] = {}


class Recommendation(BaseModel):
    """Deterministic recommendation engine output (no ML model)."""
    grade_name:          str   = Field(..., description="Nearest matching steel grade name")
    application:         str
    estimated_lifespan_years: float
    max_repair_cycles:   int
    standard_reference:  str
    verdict:             str   = Field(..., description="Plain-language engineering verdict")
    remaining_repairs:   int


class CostEstimate(BaseModel):
    """Thin wrapper from cost_service."""
    cost_per_m3_inr:  float
    total_cost_inr:   float
    cost_notes:       list[str] = []


# ── Unified response ─────────────────────────────────────────────────────────
class EnhancedSteelPrediction(BaseModel):
    """Full six-module response — frontend depends on this schema from day one."""
    status:        str
    model_used:    str

    # Six modules
    mechanical:    MechanicalProperties
    thermal:       ThermalProperties
    strength:      StrengthProperties
    repair:        RepairStrength
    degradation:   DegradationProfile
    suitability:   SuitabilityVerdict

    # Deterministic recommendation engine
    recommendation: Recommendation

    # Cost integration (from cost_service thin wrapper)
    cost: Optional[CostEstimate] = None
