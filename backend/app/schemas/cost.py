from typing import Literal
from pydantic import BaseModel, Field


class CostInput(BaseModel):
    material_type: Literal["concrete", "steel", "materials"] = Field(
        ..., description="Material category"
    )
    volume_m3: float = Field(..., ge=0.01, le=10000.0, description="Volume of material (m³)")

    # Concrete components (kg/m³)
    cement: float = Field(0.0, ge=0.0, description="Cement (kg/m³)")
    blast_furnace_slag: float = Field(0.0, ge=0.0, description="Blast furnace slag (kg/m³)")
    fly_ash: float = Field(0.0, ge=0.0, description="Fly ash (kg/m³)")
    water: float = Field(0.0, ge=0.0, description="Water (kg/m³)")
    superplasticizer: float = Field(0.0, ge=0.0, description="Superplasticizer (kg/m³)")
    coarse_aggregate: float = Field(0.0, ge=0.0, description="Coarse aggregate (kg/m³)")
    fine_aggregate: float = Field(0.0, ge=0.0, description="Fine aggregate (kg/m³)")

    # Steel alloying elements (wt%)
    c: float = Field(0.0, ge=0.0, description="Carbon wt%")
    mn: float = Field(0.0, ge=0.0, description="Manganese wt%")
    si: float = Field(0.0, ge=0.0, description="Silicon wt%")
    cr: float = Field(0.0, ge=0.0, description="Chromium wt%")
    ni: float = Field(0.0, ge=0.0, description="Nickel wt%")
    mo: float = Field(0.0, ge=0.0, description="Molybdenum wt%")
    v: float = Field(0.0, ge=0.0, description="Vanadium wt%")
    n: float = Field(0.0, ge=0.0, description="Nitrogen wt%")
    nb: float = Field(0.0, ge=0.0, description="Niobium wt%")
    co: float = Field(0.0, ge=0.0, description="Cobalt wt%")
    w: float = Field(0.0, ge=0.0, description="Tungsten wt%")
    al: float = Field(0.0, ge=0.0, description="Aluminium wt%")
    ti: float = Field(0.0, ge=0.0, description="Titanium wt%")

    # Materials (elastic properties) — for pricing by density class
    Ro: float = Field(0.0, ge=0.0, description="Density (kg/m³) — used for material pricing")

    model_config = {
        "json_schema_extra": {
            "example": {
                "material_type": "concrete",
                "volume_m3": 10.0,
                "cement": 350.0,
                "water": 185.0,
                "coarse_aggregate": 1000.0,
                "fine_aggregate": 750.0,
                "superplasticizer": 6.0,
            }
        }
    }


class CostBreakdownItem(BaseModel):
    component: str
    quantity_kg: float
    unit_cost_inr_per_kg: float
    total_cost_inr: float
    cost_fraction: float


class CostPrediction(BaseModel):
    status: str
    material_type: str
    volume_m3: float
    total_cost_inr: float
    cost_per_m3_inr: float
    breakdown: list[CostBreakdownItem]
    shap_values: dict[str, float]
    cost_notes: list[str]
