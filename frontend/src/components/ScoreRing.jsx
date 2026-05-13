import React from 'react';

export default function ScoreRing({ value, size = 220 }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  const color = value < 35 ? '#5EE0A0' : value < 65 ? '#F0C05A' : '#F47C7C';
  const glow =
    value < 35
      ? 'rgba(94,224,160,.5)'
      : value < 65
      ? 'rgba(240,192,90,.5)'
      : 'rgba(244,124,124,.5)';

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 18px ${glow})` }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#23232F" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.6,.0,.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 56, fontWeight: 600, color, lineHeight: 1 }}>
          {value}
          <span style={{ fontSize: 24, color: 'var(--text-2)', marginLeft: 2 }}>%</span>
        </div>
        <div
          className="muted"
          style={{
            fontSize: 11,
            marginTop: 6,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          AI Probability
        </div>
      </div>
    </div>
  );
}
