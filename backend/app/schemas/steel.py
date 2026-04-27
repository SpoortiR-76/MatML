from pydantic import BaseModel, Field


class SteelInput(BaseModel):
    c: float = Field(..., ge=0, le=2.0, description="Carbon wt%")
    mn: float = Field(0.0, ge=0, le=3.0, description="Manganese wt%")
    si: float = Field(0.0, ge=0, le=2.0, description="Silicon wt%")
    cr: float = Field(0.0, ge=0, le=25.0, description="Chromium wt%")
    ni: float = Field(0.0, ge=0, le=25.0, description="Nickel wt%")
    mo: float = Field(0.0, ge=0, le=5.0, description="Molybdenum wt%")
    v: float = Field(0.0, ge=0, le=2.0, description="Vanadium wt%")
    n: float = Field(0.0, ge=0, le=0.5, description="Nitrogen wt%")
    nb: float = Field(0.0, ge=0, le=0.5, description="Niobium wt%")
    co: float = Field(0.0, ge=0, le=25.0, description="Cobalt wt%")
    w: float = Field(0.0, ge=0, le=5.0, description="Tungsten wt%")
    al: float = Field(0.0, ge=0, le=2.0, description="Aluminium wt%")
    ti: float = Field(0.0, ge=0, le=2.0, description="Titanium wt%")

    model_config = {
        "json_schema_extra": {
            "example": {
                "c": 0.02, "mn": 0.05, "si": 0.05, "cr": 0.01,
                "ni": 19.7, "mo": 2.95, "v": 0.01, "n": 0.0,
                "nb": 0.01, "co": 15.0, "w": 0.0, "al": 0.15, "ti": 1.55,
            }
        }
    }


class SteelPrediction(BaseModel):
    status: str
    predicted_yield_strength_mpa: float
    predicted_tensile_strength_mpa: float
    predicted_elongation_percent: float
    model_used: str
    shap_values: dict[str, float]
