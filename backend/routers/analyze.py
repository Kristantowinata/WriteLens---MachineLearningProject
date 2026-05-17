from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.feature_extractor import extract_features
from services.predictor import predict
from services.insight_generator import generate_insights
import re

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    text = request.text.strip()

    if len(text.split()) < 20:
        raise HTTPException(status_code=400, detail="Text must contain at least 20 words")

    features, all_values = extract_features(text)

    if all_values is None:
        raise HTTPException(status_code=400, detail="Could not extract features from text")

    prediction = predict(features, all_values)
    insights = generate_insights(features)

    words = text.split()
    sentences = [s.strip() for s in re.split(r'[.!?]+(?:\s|$)', text) if s.strip()]

    return AnalyzeResponse(
        ai_probability=prediction["ai_probability"],
        zone=prediction["zone"],
        zone_label=prediction["zone_label"],
        zone_description=prediction["zone_description"],
        word_count=len(words),
        sentence_count=len(sentences),
        char_count=len(text),
        features=features,
        insights=insights,
    )
