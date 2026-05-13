from fastapi import APIRouter, HTTPException

from config import MIN_WORDS
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.feature_extractor import extract_features, split_sentences, tokenize_words
from services.insight_generator import generate_insights
from services.predictor import predict

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    text = request.text.strip()

    word_count = len(tokenize_words(text))
    if word_count < MIN_WORDS:
        raise HTTPException(
            status_code=400,
            detail=f"Text must contain at least {MIN_WORDS} words (got {word_count}).",
        )

    features = extract_features(text)
    prediction = predict(features)
    insights = generate_insights(features)

    sentence_count = len(split_sentences(text))

    return AnalyzeResponse(
        ai_probability=prediction["ai_probability"],
        zone=prediction["zone"],
        zone_label=prediction["zone_label"],
        zone_description=prediction["zone_description"],
        word_count=word_count,
        sentence_count=sentence_count,
        char_count=len(text),
        features=features,
        insights=insights,
    )
