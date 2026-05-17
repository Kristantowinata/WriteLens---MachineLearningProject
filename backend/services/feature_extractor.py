import re
import json
import os
import numpy as np
from collections import Counter
from models.schemas import FeatureResult, FeatureRange

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at",
    "for", "with", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "i", "you", "he", "she",
    "it", "we", "they", "this", "that", "these", "those", "by", "as",
    "not", "from", "so", "if", "its", "my", "your", "our", "their",
    "which", "what", "when", "where", "who", "whom", "how",
    "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "nor", "only", "own", "same", "than",
    "too", "very", "can", "will", "just", "should", "now",
}

CONJUNCTIONS = {
    "and", "but", "or", "nor", "for", "yet", "so",
    "however", "moreover", "furthermore", "additionally",
    "nevertheless", "meanwhile", "therefore", "consequently",
    "although", "whereas", "while",
}

TRANSITION_WORDS = {
    "however", "therefore", "moreover", "furthermore", "additionally",
    "consequently", "nevertheless", "meanwhile", "similarly",
    "subsequently", "accordingly", "conversely", "alternatively",
    "specifically", "particularly", "notably", "indeed",
}

PRONOUNS = {
    "i", "me", "my", "mine", "myself",
    "you", "your", "yours", "yourself",
    "he", "him", "his", "himself",
    "she", "her", "hers", "herself",
    "it", "its", "itself",
    "we", "us", "our", "ours", "ourselves",
    "they", "them", "their", "theirs", "themselves",
}

VOWEL_RE = re.compile(r'[aeiouy]+')
WORD_RE = re.compile(r"[A-Za-z']+")
SENT_RE = re.compile(r'[.!?]+(?:\s|$)')
PUNCT_RE = re.compile(r'[.,;:!?\-"\'()\[\]]')

# Load feature ranges dari JSON (dihasilkan notebook FE)
RANGES_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "feature_ranges.json")
with open(RANGES_PATH) as f:
    FEATURE_RANGES = json.load(f)

# Fitur yang ditampilin di UI (top 8)
# Model tetap pakai semua 12 secara internal
DISPLAY_FEATURES = [
    {
        "key": "syllable_per_word",
        "name": "Word Complexity",
        "description": "Average syllables per word",
        "unit": "syl", "decimals": 3,
    },
    {
        "key": "sentence_length_std",
        "name": "Sentence Length Variance",
        "description": "How much sentence length varies",
        "unit": "σ", "decimals": 2,
    },
    {
        "key": "comma_ratio",
        "name": "Comma Usage",
        "description": "Commas relative to all punctuation",
        "unit": "", "decimals": 3,
    },
    {
        "key": "punctuation_density",
        "name": "Punctuation Density",
        "description": "Punctuation marks per word",
        "unit": "", "decimals": 3,
    },
    {
        "key": "hapax_ratio",
        "name": "Vocabulary Richness",
        "description": "Words used only once / total words",
        "unit": "", "decimals": 3,
    },
    {
        "key": "conjunction_rate",
        "name": "Conjunction Frequency",
        "description": "Connecting words (and, but, however, etc.) per word",
        "unit": "", "decimals": 4,
    },
    {
        "key": "bigram_repetition_rate",
        "name": "Phrase Repetition",
        "description": "How often two-word phrases repeat",
        "unit": "", "decimals": 3,
    },
    {
        "key": "flesch_reading_ease",
        "name": "Readability Score",
        "description": "Flesch Reading Ease (higher = easier to read)",
        "unit": "", "decimals": 1,
    },
]


def _count_syllables(word):
    word = word.lower()
    groups = VOWEL_RE.findall(word)
    n = len(groups)
    if n == 0:
        return 1
    if word.endswith('e') and n > 1:
        n -= 1
    return n


def _compute_all_features(text):
    """
    Extract semua 12 fitur dari teks.
    Return dict {feature_key: value} atau None kalau teks terlalu pendek.
    HARUS match persis sama logic di notebook 02_feature_engineering.ipynb.
    """
    text = str(text)
    if len(text) < 20:
        return None

    sents = [s.strip() for s in SENT_RE.split(text) if s.strip()]
    words = WORD_RE.findall(text)
    words_lower = [w.lower() for w in words]
    n_words = len(words)
    n_sents = len(sents)

    if n_words < 5 or n_sents < 1:
        return None

    sent_lengths = [len(WORD_RE.findall(s)) for s in sents]
    sent_lengths = [c for c in sent_lengths if c > 0]
    if not sent_lengths:
        return None

    wc = Counter(words_lower)

    # Sentence-level
    avg_sl = float(np.mean(sent_lengths))
    sentence_length_std = float(np.std(sent_lengths))
    long_sentence_ratio = sum(1 for c in sent_lengths if c > 25) / len(sent_lengths)

    # Lexical diversity
    ttr = len(wc) / n_words
    hapax_ratio = sum(1 for c in wc.values() if c == 1) / n_words

    # Word choice
    function_word_ratio = sum(1 for w in words_lower if w in STOPWORDS) / n_words
    conjunction_rate = sum(1 for w in words_lower if w in CONJUNCTIONS) / n_words
    pronoun_used = {w for w in words_lower if w in PRONOUNS}
    pronoun_diversity = len(pronoun_used) / len(PRONOUNS)

    # Punctuation
    n_punct = len(PUNCT_RE.findall(text))
    punctuation_density = n_punct / n_words
    n_comma = text.count(',')
    comma_ratio = (n_comma / n_punct) if n_punct > 0 else 0.0

    # Readability
    syl = [_count_syllables(w) for w in words_lower]
    syllable_per_word = float(np.mean(syl))
    flesch_reading_ease = 206.835 - (1.015 * avg_sl) - (84.6 * syllable_per_word)

    # Transition words
    single_trans = {w for w in TRANSITION_WORDS if ' ' not in w}
    transition_word_density = sum(1 for w in words_lower if w in single_trans) / n_words

    # Bigram repetition
    bigrams = list(zip(words_lower[:-1], words_lower[1:]))
    if bigrams:
        bg_freq = Counter(bigrams)
        bigram_repetition_rate = sum(1 for c in bg_freq.values() if c > 1) / len(bigrams)
    else:
        bigram_repetition_rate = 0.0

    return {
        "syllable_per_word": syllable_per_word,
        "function_word_ratio": function_word_ratio,
        "transition_word_density": transition_word_density,
        "comma_ratio": comma_ratio,
        "flesch_reading_ease": flesch_reading_ease,
        "pronoun_diversity": pronoun_diversity,
        "hapax_ratio": hapax_ratio,
        "punctuation_density": punctuation_density,
        "conjunction_rate": conjunction_rate,
        "sentence_length_std": sentence_length_std,
        "long_sentence_ratio": long_sentence_ratio,
        "bigram_repetition_rate": bigram_repetition_rate,
    }


def _classify_status(value, human_low, human_high, ai_low, ai_high):
    in_human = human_low <= value <= human_high
    in_ai = ai_low <= value <= ai_high
    if in_ai and not in_human:
        return "ai"
    elif in_human and not in_ai:
        return "human"
    else:
        return "ambiguous"


def extract_features(text):
    """
    Public function. Extract fitur + return list FeatureResult
    buat response API (yang ditampilin di UI).
    Returns tuple: (display_features, all_values)
    - display_features: List[FeatureResult] for UI (8 features)
    - all_values: dict of all 12 features for predictor
    """
    values = _compute_all_features(text)
    if values is None:
        return [], values

    results = []
    for fdef in DISPLAY_FEATURES:
        key = fdef["key"]
        val = values.get(key, 0.0)
        r = FEATURE_RANGES.get(key, {})

        results.append(FeatureResult(
            key=key,
            name=fdef["name"],
            description=fdef["description"],
            value=round(val, fdef["decimals"]),
            unit=fdef["unit"],
            decimals=fdef["decimals"],
            human_range=FeatureRange(
                low=r.get("human_low", 0), high=r.get("human_high", 1)
            ),
            ai_range=FeatureRange(
                low=r.get("ai_low", 0), high=r.get("ai_high", 1)
            ),
            scale=FeatureRange(
                low=r.get("scale_min", 0), high=r.get("scale_max", 1)
            ),
            status=_classify_status(
                val,
                r.get("human_low", 0), r.get("human_high", 1),
                r.get("ai_low", 0), r.get("ai_high", 1),
            ),
        ))

    return results, values
