from typing import List

from models.schemas import FeatureResult, InsightResult


def generate_insights(features: List[FeatureResult]) -> List[InsightResult]:
    insights: List[InsightResult] = []
    by_key = {f.key: f for f in features}

    ttr = by_key.get("ttr")
    if ttr:
        if ttr.value < ttr.human_range.low:
            insights.append(InsightResult(
                kind="warn",
                text=(
                    "Your lexical diversity is below the typical human range. "
                    "Repetitive word use is a common trigger for AI-detector false positives."
                ),
            ))
        else:
            insights.append(InsightResult(
                kind="good",
                text=(
                    "Lexical diversity sits inside the typical human range — "
                    "varied vocabulary works in your favor."
                ),
            ))

    slv = by_key.get("slv")
    if slv:
        if slv.value < slv.human_range.low:
            insights.append(InsightResult(
                kind="warn",
                text=(
                    "Sentence lengths are very uniform. Human writing usually varies "
                    "between short punchy sentences and longer, layered ones."
                ),
            ))
        else:
            insights.append(InsightResult(
                kind="good",
                text=(
                    "Sentence-length variance is healthy — mixing short and long "
                    "sentences signals natural rhythm."
                ),
            ))

    asl = by_key.get("asl")
    if asl and asl.ai_range.low <= asl.value <= asl.ai_range.high:
        insights.append(InsightResult(
            kind="info",
            text=(
                f"Average sentence length ({asl.value:.1f} words) overlaps with "
                "the AI typical band. This alone isn't conclusive — pair it "
                "with the other features."
            ),
        ))

    return insights[:3]
