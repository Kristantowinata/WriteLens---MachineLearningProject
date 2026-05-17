from models.schemas import FeatureResult, InsightResult


def generate_insights(features):
    insights = []
    by_key = {f.key: f for f in features}

    syl = by_key.get("syllable_per_word")
    if syl:
        if syl.status == "ai":
            insights.append(InsightResult(
                kind="warn",
                text="Your writing uses more complex words (higher syllable count) "
                     "than typical human writing. AI detectors often flag this."
            ))
        elif syl.status == "human":
            insights.append(InsightResult(
                kind="good",
                text="Word complexity is in the typical human range. "
                     "Natural word choices work in your favor."
            ))

    slv = by_key.get("sentence_length_std")
    if slv:
        if slv.status == "ai":
            insights.append(InsightResult(
                kind="warn",
                text="Your sentence lengths are very uniform. Human writing usually "
                     "mixes short and long sentences more."
            ))
        elif slv.status == "human":
            insights.append(InsightResult(
                kind="good",
                text="Good sentence length variety. Mixing short and long sentences "
                     "signals natural writing rhythm."
            ))

    hapax = by_key.get("hapax_ratio")
    if hapax:
        if hapax.status == "ai":
            insights.append(InsightResult(
                kind="info",
                text="Vocabulary richness overlaps with AI patterns. "
                     "Using more unique or uncommon words can help."
            ))

    flesch = by_key.get("flesch_reading_ease")
    if flesch and len(insights) < 3:
        if flesch.value < 40:
            insights.append(InsightResult(
                kind="info",
                text="Readability score is low (text is hard to read). "
                     "Very complex text sometimes gets flagged by AI detectors."
            ))

    comma = by_key.get("comma_ratio")
    if comma and len(insights) < 3:
        if comma.status == "ai":
            insights.append(InsightResult(
                kind="info",
                text="Comma usage is higher than typical human writing. "
                     "AI tends to produce more structured, comma-heavy sentences."
            ))

    return insights[:3]
