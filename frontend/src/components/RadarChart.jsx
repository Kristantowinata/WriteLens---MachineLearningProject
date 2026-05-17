import React from 'react';

const SHORT_LABELS = {
  syllable_per_word: 'Word Complexity',
  sentence_length_std: 'Sentence Variance',
  comma_ratio: 'Comma Usage',
  punctuation_density: 'Punctuation',
  hapax_ratio: 'Vocabulary Richness',
  conjunction_rate: 'Conjunctions',
  bigram_repetition_rate: 'Phrase Repetition',
  flesch_reading_ease: 'Readability',
};

export default function RadarChart({ features, size = 400 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const N = features.length;

  const norm = (f, v) => {
    const [lo, hi] = f.scale;
    return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  };

  const pointAt = (i, r) => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const polygon = (vals) =>
    vals.map((v, i) => pointAt(i, v * radius).join(',')).join(' ');

  const userVals = features.map((f) => norm(f, f.value));
  const humanVals = features.map((f) => norm(f, (f.human[0] + f.human[1]) / 2));
  const aiVals = features.map((f) => norm(f, (f.ai[0] + f.ai[1]) / 2));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible' }}
    >
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <polygon
          key={i}
          points={Array.from({ length: N }, (_, k) =>
            pointAt(k, radius * s).join(','),
          ).join(' ')}
          fill="none"
          stroke="#23232F"
          strokeWidth="1"
        />
      ))}
      {features.map((_, i) => {
        const [x, y] = pointAt(i, radius);
        return (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#23232F" strokeWidth="1" />
        );
      })}
      <polygon
        points={polygon(aiVals)}
        fill="rgba(244,124,124,0.06)"
        stroke="#F47C7C"
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />
      <polygon
        points={polygon(humanVals)}
        fill="rgba(94,224,160,0.06)"
        stroke="#5EE0A0"
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />
      <polygon
        points={polygon(userVals)}
        fill="rgba(78,205,196,0.18)"
        stroke="#4ECDC4"
        strokeWidth="2"
      />
      {userVals.map((v, i) => {
        const [x, y] = pointAt(i, v * radius);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="#4ECDC4"
            stroke="#0B0B12"
            strokeWidth="1.5"
          />
        );
      })}
      {features.map((f, i) => {
        const [x, y] = pointAt(i, radius + 22);
        const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
        const anchor =
          Math.abs(Math.cos(angle)) < 0.3
            ? 'middle'
            : Math.cos(angle) > 0
            ? 'start'
            : 'end';
        const short = SHORT_LABELS[f.key] || f.name;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="radar-axis-label"
          >
            {short}
          </text>
        );
      })}
    </svg>
  );
}
