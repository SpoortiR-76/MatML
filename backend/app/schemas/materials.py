from pydantic import BaseModel, Field


class MaterialsInput(BaseModel):
    E: float = Field(..., ge=1000, le=500000, description="Young's Modulus (MPa)")
    G: float = Field(..., ge=500, le=250000, description="Shear Modulus (MPa)")
    mu: float = Field(..., ge=0.1, le=0.5, description="Poisson's Ratio")
    Ro: float = Field(..., ge=500, le=25000, description="Density (kg/m³)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "E": 207000,
                "G": 79000,
                "mu": 0.3,
                "Ro": 7860,
            }
        }
    }


class MaterialsPrediction(BaseModel):
    status: str
    predicted_Su_mpa: float
    predicted_Sy_mpa: float
    predicted_use: bool
    use_probability: float
    model_used: str
    shap_values: dict[str, float]
