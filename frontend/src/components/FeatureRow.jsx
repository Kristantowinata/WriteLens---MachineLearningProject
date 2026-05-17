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

/**
 * Compute dot position (0–100) on the Human ← → AI spectrum.
 * Uses status-driven zones so the dot ALWAYS matches the label:
 *   human → 5–28%   (left/green zone)
 *   ambig → 35–65%  (middle/yellow zone)
 *   ai    → 72–95%  (right/red zone)
 * Within each zone, fine-tunes based on distance to range centers.
 */
function computePosition(value, humanRange, aiRange, status) {
  const hMid = (humanRange[0] + humanRange[1]) / 2;
  const aMid = (aiRange[0] + aiRange[1]) / 2;

  // How much does the value lean toward AI? (0 = pure human, 1 = pure AI)
  const dH = Math.abs(value - hMid);
  const dA = Math.abs(value - aMid);
  const lean = (dH + dA) > 0 ? dH / (dH + dA) : 0.5;

  // Map lean into the correct zone
  switch (status) {
    case 'human': return 5 + lean * 23;   // 5% – 28%
    case 'ai':    return 72 + lean * 23;   // 72% – 95%
    default:      return 35 + lean * 30;   // 35% – 65%
  }
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

  const position = computePosition(f.value, f.human, f.ai, status);
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
