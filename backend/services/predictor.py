import os
import json
import numpy as np
import joblib
from models.schemas import FeatureResult

ML_DIR = os.path.join(os.path.dirname(__file__), "..", "ml")
MODEL_PATH = os.path.join(ML_DIR, "model.pkl")
SCALER_PATH = os.path.join(ML_DIR, "scaler.pkl")
FEATURE_ORDER_PATH = os.path.join(ML_DIR, "feature_order.json")

_model = None
_scaler = None
_feature_order = None


def _load_model():
    global _model, _scaler, _feature_order
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        with open(FEATURE_ORDER_PATH) as f:
            _feature_order = json.load(f)


def _predict_ml(all_values):
    _load_model()
    X = np.array([[all_values[k] for k in _feature_order]])
    X_scaled = _scaler.transform(X)
    proba = _model.predict_proba(X_scaled)[0]
    ai_prob = round(float(proba[1]) * 100)
    return max(0, min(100, ai_prob))


def _predict_rule_based(features):
    ai_votes = 0
    human_votes = 0
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


def predict(features, all_values=None):
    """
    Predict AI probability.
    - Kalau model.pkl ada dan all_values dikasih -> pakai ML model
    - Kalau nggak -> fallback ke rule-based
    """
    if all_values and os.path.exists(MODEL_PATH):
        ai_prob = _predict_ml(all_values)
    else:
        ai_prob = _predict_rule_based(features)

    if ai_prob < 35:
        zone = "human"
        zone_label = "Likely human"
        zone_desc = "Most features sit inside typical human ranges."
    elif ai_prob < 65:
        zone = "ambiguous"
        zone_label = "Ambiguous zone"
        zone_desc = "Some features resemble AI patterns. Common for non-native or formal writing."
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
