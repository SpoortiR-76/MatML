import logging

from app.ml.inference import predict_concrete

logger = logging.getLogger(__name__)

# Metrics stored from training — updated here when new models are trained
CONCRETE_R2 = 0.921
CONCRETE_MAE = 4.18
CONCRETE_MODEL_NAME = "RandomForestRegressor"

# Mock values for development without .pkl files
MOCK_RESPONSE = {
    "status": "success",
    "predicted_compressive_strength_mpa": 52.4,
    "model_used": "MOCK — model not loaded",
    "r2_score": 0.0,
    "mae": 0.0,
    "shap_values": {},
}


def run_concrete_prediction(models: dict, input_data: dict) -> dict:
    """
    Orchestrates concrete strength prediction.
    Falls back to mock response if model files are not loaded.
    """
    model = models.get("concrete_model")
    scaler = models.get("concrete_scaler")

    if model is None or scaler is None:
        logger.warning("Concrete model not loaded — returning mock response")
        return MOCK_RESPONSE

    try:
        result = predict_concrete(model, scaler, input_data)
        return {
            "status": "success",
            "predicted_compressive_strength_mpa": result["predicted_compressive_strength_mpa"],
            "model_used": CONCRETE_MODEL_NAME,
            "r2_score": CONCRETE_R2,
            "mae": CONCRETE_MAE,
            "shap_values": result["shap_values"],
        }
    except Exception as exc:
        logger.error("Concrete prediction failed: %s", exc, exc_info=True)
        raise
