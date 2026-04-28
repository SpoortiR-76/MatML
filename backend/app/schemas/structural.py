from typing import Literal, Optional
from pydantic import BaseModel, Field


class StructuralInput(BaseModel):
    shape: Literal["rectangular_beam", "circular_column", "rectangular_slab", "square_footing", "hollow_section"] = Field(
        ..., description="Structural member type"
    )
    material_type: Literal["concrete", "steel", "composite"] = Field(
        ..., description="Primary material type"
    )

    # Common dimensions (m)
    length: float = Field(..., ge=0.1, le=100.0, description="Span / height (m)")
    width: float = Field(..., ge=0.05, le=20.0, description="Width / diameter (m)")
    depth: float = Field(0.0, ge=0.0, le=5.0, description="Depth / thickness (m) — 0 if circular")

    # Load
    axial_load_kn: float = Field(0.0, ge=0.0, le=100_000.0, description="Axial load (kN)")
    bending_moment_knm: float = Field(0.0, ge=0.0, le=500_000.0, description="Applied bending moment (kN·m)")
    shear_force_kn: float = Field(0.0, ge=0.0, le=50_000.0, description="Applied shear force (kN)")

    # Environment & angles
    inclination_deg: float = Field(0.0, ge=0.0, le=90.0, description="Member inclination from horizontal (°)")
    exposure_class: Literal["mild", "moderate", "severe", "very_severe"] = Field(
        "moderate", description="Environmental exposure class"
    )

    construction_type: Literal["residential", "commercial", "bridge"] = Field("commercial", description="Type of construction")
    predicted_concrete_fck_mpa: Optional[float] = Field(None, description="Previously predicted concrete fck")
    predicted_steel_sy_mpa: Optional[float] = Field(None, description="Previously predicted steel Sy")

    model_config = {
        "json_schema_extra": {
            "example": {
                "shape": "rectangular_beam",
                "material_type": "concrete",
                "length": 6.0,
                "width": 0.3,
                "depth": 0.5,
                "axial_load_kn": 0.0,
                "bending_moment_knm": 120.0,
                "shear_force_kn": 80.0,
                "inclination_deg": 0.0,
                "exposure_class": "moderate",
                "construction_type": "commercial",
            }
        }
    }


class RecommendedComposition(BaseModel):
    description: str
    components: dict[str, float]
    unit: str


class StructuralPrediction(BaseModel):
    status: str
    shape: str
    material_type: str

    # Section properties
    cross_section_area_m2: float
    moment_of_inertia_m4: float
    section_modulus_m3: float
    radius_of_gyration_m: float
    slenderness_ratio: float

    # Demand
    max_bending_stress_mpa: float
    max_axial_stress_mpa: float
    max_shear_stress_mpa: float
    combined_stress_mpa: float

    # Capacity & safety
    required_strength_mpa: float
    safety_factor: float
    design_status: Literal["Safe", "Caution", "Unsafe"]

    # Recommendations
    recommended_composition: Optional[RecommendedComposition] = None
    estimated_service_life_years: int
    design_notes: list[str]
    shap_values: dict[str, float]

    # Enhanced steel recommendation (populated when material_type='steel')
    steel_recommendation: Optional[dict] = None
