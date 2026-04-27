from pydantic import BaseModel, Field


class ConcreteInput(BaseModel):
    cement: float = Field(..., ge=100, le=600, description="Cement content (kg/m³)")
    blast_furnace_slag: float = Field(0.0, ge=0, le=400, description="Blast furnace slag (kg/m³)")
    fly_ash: float = Field(0.0, ge=0, le=200, description="Fly ash (kg/m³)")
    water: float = Field(..., ge=100, le=250, description="Water (kg/m³)")
    superplasticizer: float = Field(0.0, ge=0, le=35, description="Superplasticizer (kg/m³)")
    coarse_aggregate: float = Field(..., ge=700, le=1300, description="Coarse aggregate (kg/m³)")
    fine_aggregate: float = Field(..., ge=500, le=1100, description="Fine aggregate (kg/m³)")
    age: int = Field(..., ge=1, le=365, description="Curing age (days)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "cement": 540.0,
                "blast_furnace_slag": 0.0,
                "fly_ash": 0.0,
                "water": 162.0,
                "superplasticizer": 2.5,
                "coarse_aggregate": 1040.0,
                "fine_aggregate": 676.0,
                "age": 28,
            }
        }
    }


class ConcretePrediction(BaseModel):
    status: str
    predicted_compressive_strength_mpa: float
    model_used: str
    r2_score: float
    mae: float
    shap_values: dict[str, float]
