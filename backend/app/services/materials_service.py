import logging

from app.ml.inference import predict_materials

logger = logging.getLogger(__name__)

MATERIALS_MODEL_NAME = "RandomForestRegressor + RandomForestClassifier"

MOCK_RESPONSE = {
    "status": "success",
    "predicted_Su_mpa": 421.0,
    "predicted_Sy_mpa": 314.0,
    "predicted_use": True,
    "use_probability": 0.94,
    "model_used": "MOCK — model not loaded",
    "shap_values": {},
}


def run_materials_prediction(models: dict, input_data: dict) -> dict:
    """
    Orchestrates materials regression + classification prediction.
    Falls back to mock response if model files are not loaded.
    """
    reg_model = models.get("materials_reg_model")
    cls_model = models.get("materials_cls_model")
    scaler = models.get("materials_scaler")

    if reg_model is None or cls_model is None or scaler is None:
        logger.warning("Materials model not loaded — returning mock response")
        return MOCK_RESPONSE

    try:
        result = predict_materials(reg_model, cls_model, scaler, input_data)
        return {
            "status": "success",
            "predicted_Su_mpa": result["predicted_Su_mpa"],
            "predicted_Sy_mpa": result["predicted_Sy_mpa"],
            "predicted_use": result["predicted_use"],
            "use_probability": result["use_probability"],
            "model_used": MATERIALS_MODEL_NAME,
            "shap_values": result["shap_values"],
        }
    except Exception as exc:
        logger.error("Materials prediction failed: %s", exc, exc_info=True)
        raise
