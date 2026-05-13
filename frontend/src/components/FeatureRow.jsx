import React from 'react';

export default function FeatureRow({ f }) {
  const [lo, hi] = f.scale;
  const pct = (v) => ((v - lo) / (hi - lo)) * 100;
  const userPct = Math.max(0, Math.min(100, pct(f.value)));
  const hPct1 = pct(f.human[0]);
  const hPct2 = pct(f.human[1]);
  const aPct1 = pct(f.ai[0]);
  const aPct2 = pct(f.ai[1]);

  const inHuman = f.value >= f.human[0] && f.value <= f.human[1];
  const inAI = f.value >= f.ai[0] && f.value <= f.ai[1];
  const status = inAI && !inHuman ? 'ai' : inHuman && !inAI ? 'human' : 'ambig';
  const statusLabel =
    status === 'ai' ? 'AI-like' : status === 'human' ? 'Human-like' : 'Ambiguous';
  const tagClass = status === 'ai' ? 'tag-ai' : status === 'human' ? 'tag-human' : 'tag-ambig';

  return (
    <div className="feat">
      <div>
        <div className="feat-name">{f.name}</div>
        <small style={{ color: 'var(--text-3)', display: 'block', marginTop: 3, fontSize: 12 }}>
          {f.desc}
        </small>
      </div>
      <div>
        <div className="feat-val">
          {f.value.toFixed(f.decimals)}
          <small>{f.unit}</small>
        </div>
        <span
          className={`score-tag ${tagClass}`}
          style={{ marginTop: 6, fontSize: 10.5, padding: '3px 9px' }}
        >
          {statusLabel}
        </span>
      </div>
      <div>
        <div className="range">
          <div
            className="seg-a"
            style={{ left: `${aPct1}%`, width: `${aPct2 - aPct1}%` }}
          />
          <div
            className="seg-h"
            style={{ left: `${hPct1}%`, width: `${hPct2 - hPct1}%` }}
          />
          <div className="marker" style={{ left: `calc(${userPct}% - 1.5px)` }} />
        </div>
        <div className="range-legend">
          <span>{f.scale[0]}</span>
          <span style={{ color: 'var(--ai)' }}>
            AI {f.ai[0]}&ndash;{f.ai[1]}
          </span>
          <span style={{ color: 'var(--human)' }}>
            Human {f.human[0]}&ndash;{f.human[1]}
          </span>
          <span>{f.scale[1]}</span>
        </div>
      </div>
    </div>
  );
}
