import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ML_DIR = BASE_DIR / "ml"
FRONTEND_BUILD_DIR = BASE_DIR.parent / "frontend" / "dist"

MODEL_PATH = ML_DIR / "model.pkl"
SCALER_PATH = ML_DIR / "scaler.pkl"
FEATURE_RANGES_PATH = ML_DIR / "feature_ranges.json"

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

MIN_WORDS = 20
