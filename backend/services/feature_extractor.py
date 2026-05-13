import re
from collections import Counter
from typing import List

from models.schemas import FeatureRange, FeatureResult

FEATURE_DEFINITIONS = [
    {
        "key": "asl", "name": "Average Sentence Length",
        "description": "Mean words per sentence",
        "unit": "words", "decimals": 1,
        "human_range": (14, 22), "ai_range": (18, 26), "scale": (5, 35),
    },
    {
        "key": "ttr", "name": "Lexical Diversity (TTR)",
        "description": "Unique words ÷ total words",
        "unit": "", "decimals": 3,
        "human_range": (0.55, 0.78), "ai_range": (0.38, 0.55), "scale": (0.2, 0.9),
    },
    {
        "key": "hapax", "name": "Vocabulary Richness",
        "description": "Hapax legomena ratio",
        "unit": "", "decimals": 3,
        "human_range": (0.42, 0.62), "ai_range": (0.28, 0.44), "scale": (0.15, 0.75),
    },
    {
        "key": "slv", "name": "Sentence Length Variance",
        "description": "Std. deviation of sentence length",
        "unit": "σ", "decimals": 2,
        "human_range": (5, 12), "ai_range": (2, 6), "scale": (0, 16),
    },
    {
        "key": "punc", "name": "Punctuation Density",
        "description": "Punctuation marks ÷ words",
        "unit": "", "decimals": 3,
        "human_range": (0.10, 0.18), "ai_range": (0.08, 0.14), "scale": (0, 0.25),
    },
    {
        "key": "func", "name": "Function-Word Ratio",
        "description": "Proportion of common stopwords",
        "unit": "", "decimals": 3,
        "human_range": (0.38, 0.50), "ai_range": (0.42, 0.55), "scale": (0.2, 0.65),
    },
]

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at",
    "for", "with", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "i", "you", "he", "she",
    "it", "we", "they", "this", "that", "these", "those", "by", "as",
    "not", "from", "so",
}

_WORD_RE = re.compile(r"[A-Za-z']+")
_SENTENCE_SPLIT_RE = re.compile(r"[.!?]+(?:\s|$)")
_PUNCT_RE = re.compile(r"[.,;:!?\-—()\"']")


def split_sentences(text: str) -> List[str]:
    return [s.strip() for s in _SENTENCE_SPLIT_RE.split(text) if s.strip()]


def tokenize_words(text: str) -> List[str]:
    return _WORD_RE.findall(text)


def _compute_feature_values(text: str) -> dict:
    words = tokenize_words(text)
    lower_words = [w.lower() for w in words]
    word_count = len(words)

    if word_count == 0:
        return {k: 0.0 for k in ("asl", "ttr", "hapax", "slv", "punc", "func")}

    freq = Counter(lower_words)
    unique_count = len(set(lower_words))
    hapax_count = sum(1 for c in freq.values() if c == 1)

    sentences = split_sentences(text)
    sent_lengths = [len(_WORD_RE.findall(s)) for s in sentences]
    sent_lengths = [n for n in sent_lengths if n > 0]
    avg_sent_len = sum(sent_lengths) / len(sent_lengths) if sent_lengths else 0.0
    if len(sent_lengths) > 1:
        variance = sum((sl - avg_sent_len) ** 2 for sl in sent_lengths) / len(sent_lengths)
    else:
        variance = 0.0
    stdev = variance ** 0.5

    punct_count = len(_PUNCT_RE.findall(text))
    punct_density = punct_count / word_count
    ttr = unique_count / word_count
    hapax_ratio = hapax_count / word_count
    stop_count = sum(1 for w in lower_words if w in STOPWORDS)
    stop_ratio = stop_count / word_count

    return {
        "asl": avg_sent_len,
        "ttr": ttr,
        "hapax": hapax_ratio,
        "slv": stdev,
        "punc": punct_density,
        "func": stop_ratio,
    }


def _classify_status(value: float, human_range: tuple, ai_range: tuple) -> str:
    in_human = human_range[0] <= value <= human_range[1]
    in_ai = ai_range[0] <= value <= ai_range[1]
    if in_ai and not in_human:
        return "ai"
    if in_human and not in_ai:
        return "human"
    return "ambiguous"


def extract_features(text: str) -> List[FeatureResult]:
    values = _compute_feature_values(text)

    results = []
    for fdef in FEATURE_DEFINITIONS:
        raw = values.get(fdef["key"], 0.0)
        status = _classify_status(raw, fdef["human_range"], fdef["ai_range"])
        results.append(FeatureResult(
            key=fdef["key"],
            name=fdef["name"],
            description=fdef["description"],
            value=round(raw, fdef["decimals"]),
            unit=fdef["unit"],
            decimals=fdef["decimals"],
            human_range=FeatureRange(low=fdef["human_range"][0], high=fdef["human_range"][1]),
            ai_range=FeatureRange(low=fdef["ai_range"][0], high=fdef["ai_range"][1]),
            scale=FeatureRange(low=fdef["scale"][0], high=fdef["scale"][1]),
            status=status,
        ))
    return results
