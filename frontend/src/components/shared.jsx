import React from 'react';

export function SectionEyebrow({ eyebrow, title, sub }) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: 'var(--accent)',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        &mdash; {eyebrow}
      </div>
      <h2
        className="display"
        style={{ fontSize: 36, fontWeight: 600, margin: '0 0 12px', maxWidth: 640 }}
      >
        {title}
      </h2>
      {sub && (
        <p
          className="muted"
          style={{ fontSize: 16, maxWidth: 560, margin: 0, lineHeight: 1.6 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div>
      <div className="mono display" style={{ fontSize: 24, fontWeight: 600 }}>
        {value}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
