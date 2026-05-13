from typing import List

from config import MODEL_PATH, SCALER_PATH, USE_ML_MODEL
from models.schemas import FeatureResult

FEATURE_ORDER = ["asl", "ttr", "hapax", "slv", "punc", "func"]

_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    if _model is None:
        import joblib
        _model = joblib.load(MODEL_PATH)
        if SCALER_PATH.exists():
            _scaler = joblib.load(SCALER_PATH)


def _predict_rule_based(features: List[FeatureResult]) -> int:
    ai_votes = 0.0
    human_votes = 0.0

    for f in features:
        in_human = f.human_range.low <= f.value <= f.human_range.high
        in_ai = f.ai_range.low <= f.value <= f.ai_range.high
        if in_ai and not in_human:
            ai_votes += 1
        elif in_human and not in_ai:
            human_votes += 1
        elif in_ai and in_human:
            ai_votes += 0.5
            human_votes += 0.5

    total = len(features)
    ai_prob = round(((ai_votes + 0.5) / (total + 1)) * 100)
    return max(0, min(100, ai_prob))


def _predict_ml(features: List[FeatureResult]) -> int:
    import numpy as np
    _load_model()

    feature_dict = {f.key: f.value for f in features}
    X = np.array([[feature_dict[k] for k in FEATURE_ORDER]])

    if _scaler is not None:
        X = _scaler.transform(X)

    proba = _model.predict_proba(X)[0]
    ai_prob = round(float(proba[1]) * 100)
    return max(0, min(100, ai_prob))


def predict(features: List[FeatureResult]) -> dict:
    if USE_ML_MODEL and MODEL_PATH.exists():
        ai_prob = _predict_ml(features)
    else:
        ai_prob = _predict_rule_based(features)

    if ai_prob < 35:
        zone = "human"
        zone_label = "Likely human"
        zone_desc = "Most features sit inside typical human ranges."
    elif ai_prob < 65:
        zone = "ambiguous"
        zone_label = "Ambiguous zone"
        zone_desc = "Some features resemble AI patterns — common for non-native or formal writing."
    else:
        zone = "ai"
        zone_label = "AI-like patterns"
        zone_desc = "Several features overlap with patterns AI models tend to produce."

    return {
        "ai_probability": ai_prob,
        "zone": zone,
        "zone_label": zone_label,
        "zone_description": zone_desc,
    }
