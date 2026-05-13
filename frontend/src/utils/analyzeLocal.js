const STOPWORDS = new Set([
  'the','a','an','and','or','but','of','to','in','on','at','for','with',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','i','you','he','she','it','we','they','this','that',
  'these','those','by','as','not','from','so',
]);

export function analyzeTextLocal(raw) {
  const text = (raw || '').trim();
  if (!text) return null;

  const sentences = text.split(/[.!?]+(?:\s|$)/).map(s => s.trim()).filter(Boolean);
  const words = text.match(/[A-Za-z']+/g) || [];
  const wordCount = words.length;
  const charCount = text.length;
  const lowerWords = words.map(w => w.toLowerCase());
  const uniqueWords = new Set(lowerWords);
  const freq = {};
  lowerWords.forEach(w => (freq[w] = (freq[w] || 0) + 1));
  const hapax = Object.values(freq).filter(c => c === 1).length;

  const sentLens = sentences
    .map(s => (s.match(/[A-Za-z']+/g) || []).length)
    .filter(n => n > 0);
  const avgSent = sentLens.length
    ? sentLens.reduce((a, b) => a + b, 0) / sentLens.length
    : 0;
  const variance =
    sentLens.length > 1
      ? sentLens.reduce((a, b) => a + Math.pow(b - avgSent, 2), 0) / sentLens.length
      : 0;
  const stdev = Math.sqrt(variance);

  const punctCount = (text.match(/[.,;:!?\-—()"']/g) || []).length;
  const punctDensity = wordCount ? punctCount / wordCount : 0;
  const ttr = wordCount ? uniqueWords.size / wordCount : 0;
  const hapaxRatio = wordCount ? hapax / wordCount : 0;
  const stopCount = lowerWords.filter(w => STOPWORDS.has(w)).length;
  const stopRatio = wordCount ? stopCount / wordCount : 0;

  const features = [
    {
      key: 'asl', name: 'Average Sentence Length',
      desc: 'Mean words per sentence',
      value: avgSent, unit: 'words', decimals: 1,
      human: [14, 22], ai: [18, 26], scale: [5, 35],
    },
    {
      key: 'ttr', name: 'Lexical Diversity (TTR)',
      desc: 'Unique words ÷ total words',
      value: ttr, unit: '', decimals: 3,
      human: [0.55, 0.78], ai: [0.38, 0.55], scale: [0.2, 0.9],
    },
    {
      key: 'hapax', name: 'Vocabulary Richness',
      desc: 'Hapax legomena ratio',
      value: hapaxRatio, unit: '', decimals: 3,
      human: [0.42, 0.62], ai: [0.28, 0.44], scale: [0.15, 0.75],
    },
    {
      key: 'slv', name: 'Sentence Length Variance',
      desc: 'Std. deviation of sentence length',
      value: stdev, unit: 'σ', decimals: 2,
      human: [5, 12], ai: [2, 6], scale: [0, 16],
    },
    {
      key: 'punc', name: 'Punctuation Density',
      desc: 'Punctuation marks ÷ words',
      value: punctDensity, unit: '', decimals: 3,
      human: [0.10, 0.18], ai: [0.08, 0.14], scale: [0, 0.25],
    },
    {
      key: 'func', name: 'Function-Word Ratio',
      desc: 'Proportion of common stopwords',
      value: stopRatio, unit: '', decimals: 3,
      human: [0.38, 0.50], ai: [0.42, 0.55], scale: [0.2, 0.65],
    },
  ];

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
  const aiProb = Math.round(((aiVotes + 0.5) / (total + 1)) * 100);

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

  const ttr = byKey.ttr;
  if (ttr.value < ttr.human[0]) {
    out.push({
      kind: 'warn',
      text: 'Your lexical diversity is below the typical human range. Repetitive word use is a common trigger for AI-detector false positives.',
    });
  } else {
    out.push({
      kind: 'good',
      text: 'Lexical diversity sits inside the typical human range — varied vocabulary works in your favor.',
    });
  }

  const slv = byKey.slv;
  if (slv.value < slv.human[0]) {
    out.push({
      kind: 'warn',
      text: 'Sentence lengths are very uniform. Human writing usually varies between short punchy sentences and longer, layered ones.',
    });
  } else {
    out.push({
      kind: 'good',
      text: 'Sentence-length variance is healthy — mixing short and long sentences signals natural rhythm.',
    });
  }

  const asl = byKey.asl;
  if (asl.value > asl.ai[0] && asl.value < asl.ai[1]) {
    out.push({
      kind: 'info',
      text: `Average sentence length (${asl.value.toFixed(1)} words) overlaps with the AI typical band. This alone isn't conclusive — pair it with the other features.`,
    });
  }

  return out.slice(0, 3);
}
