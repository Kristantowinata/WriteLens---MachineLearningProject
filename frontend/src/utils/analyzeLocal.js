const STOPWORDS = new Set([
  'the','a','an','and','or','but','of','to','in','on','at','for','with',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','i','you','he','she','it','we','they','this','that',
  'these','those','by','as','not','from','so','if','its','my','your',
  'our','their','which','what','when','where','who','whom','how',
  'all','each','every','both','few','more','most','other','some','such',
  'no','nor','only','own','same','than','too','very','can','will','just',
  'should','now',
]);

const CONJUNCTIONS = new Set([
  'and','but','or','nor','for','yet','so',
  'however','moreover','furthermore','additionally',
  'nevertheless','meanwhile','therefore','consequently',
  'although','whereas','while',
]);

const TRANSITION_WORDS = new Set([
  'however','therefore','moreover','furthermore','additionally',
  'consequently','nevertheless','meanwhile','similarly',
  'subsequently','accordingly','conversely','alternatively',
  'specifically','particularly','notably','indeed',
]);

const PRONOUNS = new Set([
  'i','me','my','mine','myself',
  'you','your','yours','yourself',
  'he','him','his','himself',
  'she','her','hers','herself',
  'it','its','itself',
  'we','us','our','ours','ourselves',
  'they','them','their','theirs','themselves',
]);

// Feature ranges from feature_ranges.json (embedded for offline fallback)
const FEATURE_RANGES = {
  syllable_per_word: { human_low: 1.3074, human_high: 1.5974, ai_low: 1.3562, ai_high: 1.7889, scale_min: 1.2105, scale_max: 1.9529 },
  function_word_ratio: { human_low: 0.3936, human_high: 0.4932, ai_low: 0.3497, ai_high: 0.4760, scale_min: 0.2857, scale_max: 0.5358 },
  transition_word_density: { human_low: 0.0, human_high: 0.0025, ai_low: 0.0, ai_high: 0.0072, scale_min: 0.0, scale_max: 0.0128 },
  comma_ratio: { human_low: 0.1228, human_high: 0.4286, ai_low: 0.1667, ai_high: 0.5116, scale_min: 0.0, scale_max: 0.6 },
  flesch_reading_ease: { human_low: 47.5248, human_high: 78.3247, ai_low: 33.0753, ai_high: 76.3033, scale_min: 14.3029, scale_max: 90.529 },
  pronoun_diversity: { human_low: 0.1, human_high: 0.3333, ai_low: 0.0667, ai_high: 0.3, scale_min: 0.0, scale_max: 0.4667 },
  hapax_ratio: { human_low: 0.2087, human_high: 0.5349, ai_low: 0.2167, ai_high: 0.6695, scale_min: 0.1257, scale_max: 0.8333 },
  punctuation_density: { human_low: 0.0784, human_high: 0.1805, ai_low: 0.1008, ai_high: 0.1964, scale_min: 0.0519, scale_max: 0.3030 },
  conjunction_rate: { human_low: 0.0345, human_high: 0.0704, ai_low: 0.0348, ai_high: 0.0816, scale_min: 0.0129, scale_max: 0.1020 },
  sentence_length_std: { human_low: 5.2951, human_high: 13.6149, ai_low: 4.1539, ai_high: 10.0747, scale_min: 1.2472, scale_max: 24.2934 },
  long_sentence_ratio: { human_low: 0.0, human_high: 0.5, ai_low: 0.0, ai_high: 0.4444, scale_min: 0.0, scale_max: 0.8571 },
  bigram_repetition_rate: { human_low: 0.0306, human_high: 0.1206, ai_low: 0.0131, ai_high: 0.1559, scale_min: 0.0, scale_max: 0.2010 },
};

// Display features (top 8)
const DISPLAY_FEATURES = [
  { key: 'syllable_per_word', name: 'Word Complexity', desc: 'Average syllables per word', unit: 'syl', decimals: 3 },
  { key: 'sentence_length_std', name: 'Sentence Length Variance', desc: 'How much sentence length varies', unit: 'σ', decimals: 2 },
  { key: 'comma_ratio', name: 'Comma Usage', desc: 'Commas relative to all punctuation', unit: '', decimals: 3 },
  { key: 'punctuation_density', name: 'Punctuation Density', desc: 'Punctuation marks per word', unit: '', decimals: 3 },
  { key: 'hapax_ratio', name: 'Vocabulary Richness', desc: 'Words used only once / total words', unit: '', decimals: 3 },
  { key: 'conjunction_rate', name: 'Conjunction Frequency', desc: 'Connecting words per word', unit: '', decimals: 4 },
  { key: 'bigram_repetition_rate', name: 'Phrase Repetition', desc: 'How often two-word phrases repeat', unit: '', decimals: 3 },
  { key: 'flesch_reading_ease', name: 'Readability Score', desc: 'Flesch Reading Ease (higher = easier)', unit: '', decimals: 1 },
];

function countSyllables(word) {
  word = word.toLowerCase();
  const groups = word.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 0;
  if (n === 0) return 1;
  if (word.endsWith('e') && n > 1) n--;
  return n;
}

function classifyStatus(value, r) {
  const inHuman = value >= r.human_low && value <= r.human_high;
  const inAI = value >= r.ai_low && value <= r.ai_high;
  if (inAI && !inHuman) return 'ai';
  if (inHuman && !inAI) return 'human';
  return 'ambiguous';
}

export function analyzeTextLocal(raw) {
  const text = (raw || '').trim();
  if (!text) return null;

  const sentences = text.split(/[.!?]+(?:\s|$)/).map(s => s.trim()).filter(Boolean);
  const words = text.match(/[A-Za-z']+/g) || [];
  const wordCount = words.length;
  const charCount = text.length;
  const lowerWords = words.map(w => w.toLowerCase());
  const nWords = lowerWords.length;

  if (nWords < 5 || sentences.length < 1) return null;

  const freq = {};
  lowerWords.forEach(w => (freq[w] = (freq[w] || 0) + 1));

  const sentLens = sentences
    .map(s => (s.match(/[A-Za-z']+/g) || []).length)
    .filter(n => n > 0);
  if (!sentLens.length) return null;

  const avgSL = sentLens.reduce((a, b) => a + b, 0) / sentLens.length;
  const variance = sentLens.reduce((a, b) => a + Math.pow(b - avgSL, 2), 0) / sentLens.length;
  const sentence_length_std = Math.sqrt(variance);
  const long_sentence_ratio = sentLens.filter(c => c > 25).length / sentLens.length;

  const hapax_ratio = Object.values(freq).filter(c => c === 1).length / nWords;
  const function_word_ratio = lowerWords.filter(w => STOPWORDS.has(w)).length / nWords;
  const conjunction_rate = lowerWords.filter(w => CONJUNCTIONS.has(w)).length / nWords;

  const pronounUsed = new Set(lowerWords.filter(w => PRONOUNS.has(w)));
  const pronoun_diversity = pronounUsed.size / PRONOUNS.size;

  const punctMatches = text.match(/[.,;:!?\-"'()\[\]]/g) || [];
  const nPunct = punctMatches.length;
  const punctuation_density = nPunct / nWords;
  const nComma = (text.match(/,/g) || []).length;
  const comma_ratio = nPunct > 0 ? nComma / nPunct : 0;

  const syls = lowerWords.map(countSyllables);
  const syllable_per_word = syls.reduce((a, b) => a + b, 0) / nWords;
  const flesch_reading_ease = 206.835 - (1.015 * avgSL) - (84.6 * syllable_per_word);

  const singleTrans = [...TRANSITION_WORDS].filter(w => !w.includes(' '));
  const singleTransSet = new Set(singleTrans);
  const transition_word_density = lowerWords.filter(w => singleTransSet.has(w)).length / nWords;

  const bigrams = [];
  for (let i = 0; i < lowerWords.length - 1; i++) {
    bigrams.push(lowerWords[i] + ' ' + lowerWords[i + 1]);
  }
  let bigram_repetition_rate = 0;
  if (bigrams.length) {
    const bgFreq = {};
    bigrams.forEach(b => (bgFreq[b] = (bgFreq[b] || 0) + 1));
    bigram_repetition_rate = Object.values(bgFreq).filter(c => c > 1).length / bigrams.length;
  }

  const allValues = {
    syllable_per_word, function_word_ratio, transition_word_density,
    comma_ratio, flesch_reading_ease, pronoun_diversity, hapax_ratio,
    punctuation_density, conjunction_rate, sentence_length_std,
    long_sentence_ratio, bigram_repetition_rate,
  };

  // Build display features (8)
  const features = DISPLAY_FEATURES.map(fdef => {
    const val = allValues[fdef.key] || 0;
    const r = FEATURE_RANGES[fdef.key];
    return {
      key: fdef.key,
      name: fdef.name,
      desc: fdef.desc,
      value: parseFloat(val.toFixed(fdef.decimals)),
      unit: fdef.unit,
      decimals: fdef.decimals,
      human: [r.human_low, r.human_high],
      ai: [r.ai_low, r.ai_high],
      scale: [r.scale_min, r.scale_max],
      status: classifyStatus(val, r),
    };
  });

  // Rule-based scoring (fallback when backend is down)
  let aiVotes = 0;
  let humanVotes = 0;
  features.forEach(f => {
    const inHuman = f.value >= f.human[0] && f.value <= f.human[1];
    const inAI = f.value >= f.ai[0] && f.value <= f.ai[1];
    if (inAI && !inHuman) aiVotes++;
    else if (inHuman && !inAI) humanVotes++;
    else if (inAI && inHuman) {
      aiVotes += 0.5;
      humanVotes += 0.5;
    }
  });
  const total = features.length;
  const aiProb = Math.max(0, Math.min(100, Math.round(((aiVotes + 0.5) / (total + 1)) * 100)));

  return {
    wordCount,
    charCount,
    sentenceCount: sentences.length,
    features,
    aiProb,
  };
}

export function generateInsightsLocal(result) {
  const out = [];
  const byKey = Object.fromEntries(result.features.map(f => [f.key, f]));

  const syl = byKey.syllable_per_word;
  if (syl) {
    if (syl.status === 'ai') {
      out.push({
        kind: 'warn',
        text: 'Your writing uses more complex words (higher syllable count) than typical human writing. AI detectors often flag this.',
      });
    } else if (syl.status === 'human') {
      out.push({
        kind: 'good',
        text: 'Word complexity is in the typical human range. Natural word choices work in your favor.',
      });
    }
  }

  const slv = byKey.sentence_length_std;
  if (slv) {
    if (slv.status === 'ai') {
      out.push({
        kind: 'warn',
        text: 'Your sentence lengths are very uniform. Human writing usually mixes short and long sentences more.',
      });
    } else if (slv.status === 'human') {
      out.push({
        kind: 'good',
        text: 'Good sentence length variety. Mixing short and long sentences signals natural writing rhythm.',
      });
    }
  }

  const hapax = byKey.hapax_ratio;
  if (hapax && hapax.status === 'ai') {
    out.push({
      kind: 'info',
      text: 'Vocabulary richness overlaps with AI patterns. Using more unique or uncommon words can help.',
    });
  }

  return out.slice(0, 3);
}
