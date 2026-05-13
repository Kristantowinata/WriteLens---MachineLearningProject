from typing import List, Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to analyze (min ~20 words)")


class FeatureRange(BaseModel):
    low: float
    high: float


class FeatureResult(BaseModel):
    key: str
    name: str
    description: str
    value: float
    unit: str
    decimals: int
    human_range: FeatureRange
    ai_range: FeatureRange
    scale: FeatureRange
    status: Literal["human", "ai", "ambiguous"]


class InsightResult(BaseModel):
    kind: Literal["warn", "good", "info"]
    text: str


class AnalyzeResponse(BaseModel):
    ai_probability: int
    zone: Literal["human", "ambiguous", "ai"]
    zone_label: str
    zone_description: str
    word_count: int
    sentence_count: int
    char_count: int
    features: List[FeatureResult]
    insights: List[InsightResult]
