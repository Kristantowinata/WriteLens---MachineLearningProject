const API_BASE =
  import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000';

export async function analyzeText(text) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis failed');
  }

  const data = await response.json();

  // Map snake_case API response to camelCase frontend format
  return {
    aiProb: data.ai_probability,
    wordCount: data.word_count,
    sentenceCount: data.sentence_count,
    charCount: data.char_count,
    features: data.features.map(f => ({
      key: f.key,
      name: f.name,
      desc: f.description,
      value: f.value,
      unit: f.unit,
      decimals: f.decimals,
      human: [f.human_range.low, f.human_range.high],
      ai: [f.ai_range.low, f.ai_range.high],
      scale: [f.scale.low, f.scale.high],
    })),
    insights: data.insights,
    zone: data.zone,
    zoneLabel: data.zone_label,
    zoneDesc: data.zone_description,
  };
}
