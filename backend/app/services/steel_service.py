import logging

from app.ml.inference import predict_steel

logger = logging.getLogger(__name__)

STEEL_MODEL_NAME = "MultiOutputRegressor(XGBRegressor)"

MOCK_RESPONSE = {
    "status": "success",
    "predicted_yield_strength_mpa": 450.0,
    "predicted_tensile_strength_mpa": 600.0,
    "predicted_elongation_percent": 20.0,
    "model_used": "MOCK — model not loaded",
    "shap_values": {},
}


def run_steel_prediction(models: dict, input_data: dict) -> dict:
    """
    Orchestrates steel multi-property prediction.
    Falls back to mock response if model files are not loaded.
    """
    model = models.get("steel_model")
    scaler = models.get("steel_scaler")

    if model is None or scaler is None:
        logger.warning("Steel model not loaded — returning mock response")
        return MOCK_RESPONSE

    try:
        result = predict_steel(model, scaler, input_data)
        return {
            "status": "success",
            "predicted_yield_strength_mpa": result["predicted_yield_strength_mpa"],
            "predicted_tensile_strength_mpa": result["predicted_tensile_strength_mpa"],
            "predicted_elongation_percent": result["predicted_elongation_percent"],
            "model_used": STEEL_MODEL_NAME,
            "shap_values": result["shap_values"],
        }
    except Exception as exc:
        logger.error("Steel prediction failed: %s", exc, exc_info=True)
        raise
