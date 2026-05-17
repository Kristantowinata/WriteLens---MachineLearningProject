import React from 'react';

function formatValue(f) {
  switch (f.key) {
    case 'flesch_reading_ease':
      return { display: Math.round(f.value), suffix: '/ 100' };
    case 'sentence_length_std':
      return { display: f.value.toFixed(1), suffix: f.unit };
    case 'syllable_per_word':
      return { display: f.value.toFixed(2), suffix: f.unit };
    default:
      return { display: (f.value * 100).toFixed(1), suffix: '%' };
  }
}

function computePosition(value, humanRange, aiRange) {
  const hMid = (humanRange[0] + humanRange[1]) / 2;
  const aMid = (aiRange[0] + aiRange[1]) / 2;
  const diff = aMid - hMid;
  if (Math.abs(diff) < 0.0001) return 50;
  const raw = ((value - hMid) / diff) * 100;
  return Math.max(5, Math.min(95, raw));
}

const VERDICTS = {
  human: '✓ Looks natural',
  ambig: '~ In between',
  ai: '⚠ Leans toward AI',
};

export default function FeatureRow({ f }) {
  const inHuman = f.value >= f.human[0] && f.value <= f.human[1];
  const inAI = f.value >= f.ai[0] && f.value <= f.ai[1];
  const status = inAI && !inHuman ? 'ai' : inHuman && !inAI ? 'human' : 'ambig';
  const statusLabel =
    status === 'ai' ? 'AI-like' : status === 'human' ? 'Human-like' : 'Ambiguous';
  const tagClass = status === 'ai' ? 'tag-ai' : status === 'human' ? 'tag-human' : 'tag-ambig';

  const position = computePosition(f.value, f.human, f.ai);
  const { display, suffix } = formatValue(f);
  const dotColor =
    status === 'human' ? 'var(--human)' : status === 'ai' ? 'var(--ai)' : 'var(--ambig)';

  return (
    <div className="feat">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="feat-name">{f.name}</span>
          <span
            className={`score-tag ${tagClass}`}
            style={{ fontSize: 10, padding: '2px 8px', lineHeight: '14px' }}
          >
            {statusLabel}
          </span>
        </div>
        <small style={{ color: 'var(--text-3)', display: 'block', marginTop: 4, fontSize: 12 }}>
          {f.desc}
        </small>
      </div>
      <div className="feat-val">
        {display}
        <small>{suffix}</small>
      </div>
      <div>
        <div className="spectrum">
          <div
            className="spectrum-dot"
            style={{
              left: `${position}%`,
              background: dotColor,
              boxShadow: `0 0 8px ${dotColor}`,
            }}
          />
        </div>
        <div className="spectrum-labels">
          <span style={{ color: 'var(--human)' }}>Human</span>
          <span style={{ color: dotColor, fontWeight: 500 }}>{VERDICTS[status]}</span>
          <span style={{ color: 'var(--ai)' }}>AI</span>
        </div>
      </div>
    </div>
  );
}
