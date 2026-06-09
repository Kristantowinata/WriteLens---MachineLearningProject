import React from 'react';
import {
  IcoClip,
  IcoLens,
  IcoChart,
  IcoArrow,
  IcoWarn,
  IcoSpark,
} from '../components/icons.jsx';
import { SectionEyebrow } from '../components/shared.jsx';
import ScoreRing from '../components/ScoreRing.jsx';

function WhyCard({ ico, accent, title, body }) {
  return (
    <div className="card card-pad" style={{ display: 'flex', gap: 18 }}>
      <div
        style={{
          flexShrink: 0,
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `color-mix(in oklab, ${accent} 10%, transparent)`,
          border: `1px solid color-mix(in oklab, ${accent} 28%, transparent)`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {ico}
      </div>
      <div>
        <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
          {title}
        </h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function PreviewMockup() {
  const mockFeatures = [
    { name: 'Word Complexity', v: '1.58', suffix: 'syl', position: 62, status: 'ambig' },
    { name: 'Comma Usage', v: '38.2', suffix: '%', position: 78, status: 'ai' },
    { name: 'Punctuation Density', v: '12.4', suffix: '%', position: 22, status: 'human' },
    { name: 'Sentence Length Variance', v: '5.8', suffix: 'σ', position: 74, status: 'ai' },
  ];

  return (
    <div
      className="card"
      style={{
        padding: 22,
        textAlign: 'left',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,.5), 0 0 0 1px var(--border)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3a4d' }} />
          <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3a4d' }} />
          <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3a4d' }} />
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
          writelens - analysis
        </span>
        <span className="pill" style={{ fontSize: 11 }}>
          <span
            className="dot"
            style={{ background: 'var(--ambig)', boxShadow: '0 0 8px var(--ambig)' }}
          />
          Ambiguous
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <ScoreRing value={62} size={180} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockFeatures.map((r, i) => {
            const dotColor =
              r.status === 'human' ? 'var(--human)' : r.status === 'ai' ? 'var(--ai)' : 'var(--ambig)';
            const statusLabel =
              r.status === 'human' ? 'Human-like' : r.status === 'ai' ? 'AI-like' : 'Ambiguous';
            const tagClass =
              r.status === 'ai' ? 'tag-ai' : r.status === 'human' ? 'tag-human' : 'tag-ambig';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                    <span
                      className={`score-tag ${tagClass}`}
                      style={{ fontSize: 9, padding: '1px 6px', lineHeight: '13px' }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <span className="mono" style={{ color: 'var(--text-2)', fontSize: 12 }}>
                    {r.v}<small style={{ color: 'var(--text-3)', marginLeft: 2 }}>{r.suffix}</small>
                  </span>
                </div>
                <div className="spectrum" style={{ height: 5 }}>
                  <div
                    className="spectrum-dot"
                    style={{
                      left: `${r.position}%`,
                      background: dotColor,
                      boxShadow: `0 0 6px ${dotColor}`,
                      width: 10, height: 10,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ setPage }) {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 88, paddingBottom: 96 }}>
        <div
          className="hero-glow"
          style={{ position: 'absolute', top: -240, left: '50%', transform: 'translateX(-50%)' }}
        />
        <div
          className="container"
          style={{ position: 'relative', textAlign: 'center', maxWidth: 880 }}
        >
          <div className="pill" style={{ marginBottom: 28 }}>
            <span className="dot" />
            Self-assessment for non-native writers
          </div>
          <h1
            className="display"
            style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 600, margin: '0 0 22px' }}
          >
            See your writing through
            <br />
            a different{' '}
            <span style={{ color: 'var(--accent)', position: 'relative' }}>
              lens
              <svg
                width="120"
                height="14"
                style={{ position: 'absolute', left: 0, bottom: -8, width: '100%' }}
                viewBox="0 0 120 14"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9 C 30 3, 60 12, 118 5"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>
          <p
            className="muted"
            style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 36px' }}
          >
            AI detectors frequently misflag non-native English writing. WriteLens shows you which
            stylometric features in your essay trigger those false positives - so you can
            understand your own writing, not be judged by it.
          </p>
          <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setPage('analyzer')}>
              Try the Analyzer <IcoArrow size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => setPage('about')}>
              How it works
            </button>
          </div>
          <div style={{ marginTop: 72, position: 'relative' }}>
            <PreviewMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ paddingTop: 24, paddingBottom: 96 }}>
        <SectionEyebrow
          eyebrow="How it works"
          title="Three steps to insight"
          sub="No accounts, no uploads kept. Your text stays in your browser session."
        />
        <div className="grid-3" style={{ marginTop: 48 }}>
          {[
            {
              i: <IcoClip size={20} />,
              n: '01',
              t: 'Paste or Upload',
              d: 'Drop in your essay text, or upload a .txt / .docx file. We support drafts up to ~10,000 words.',
            },
            {
              i: <IcoLens size={20} />,
              n: '02',
              t: 'Analyze',
              d: 'We compute stylometric features - word complexity, sentence length variance, vocabulary richness, and more.',
            },
            {
              i: <IcoChart size={20} />,
              n: '03',
              t: 'Understand',
              d: 'See exactly which features fall inside the AI-like band, and which sit comfortably in human territory.',
            },
          ].map((s, i) => (
            <div key={i} className="card card-pad" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(78,205,196,.08)',
                    border: '1px solid rgba(78,205,196,.22)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.i}
                </div>
                <span className="mono" style={{ color: 'var(--text-3)', fontSize: 12 }}>
                  {s.n}
                </span>
              </div>
              <h3 className="display" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
                {s.t}
              </h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why WriteLens */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <SectionEyebrow
          eyebrow="Why WriteLens"
          title="Detectors weren't trained on you"
          sub="The same patterns that make non-native writing distinct are the ones detectors learned to flag."
        />
        <div className="grid-2" style={{ marginTop: 48 }}>
          <WhyCard
            ico={<IcoWarn size={18} />}
            accent="var(--ai)"
            title="AI detectors flag non-native writing"
            body="Studies show detectors classify non-native English essays as AI-generated up to 60% more often than native ones. Lower word complexity and uniform sentence rhythm - both common second-language traits - sit inside the AI typical band."
          />
          <WhyCard
            ico={<IcoLens size={18} />}
            accent="var(--accent)"
            title="Transparency over verdict"
            body="Other tools give you a number and walk away. WriteLens shows the math: for each feature, where your value sits relative to typical human and AI ranges - so you can decide what it means."
          />
          <WhyCard
            ico={<IcoSpark size={18} />}
            accent="var(--amber)"
            title="Actionable, not punitive"
            body={'Instead of accusations, you get specific signals - "your sentence length variance is low," "your vocabulary richness is healthy." Use them to understand your style, not to defend yourself.'}
          />
          <WhyCard
            ico={<IcoChart size={18} />}
            accent="var(--human)"
            title="Grounded in stylometry"
            body="The same features computational linguists have used for decades to study authorship - word complexity, hapax legomena, sentence-length variance. No black-box LLM judging your writing."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div
          className="card card-pad"
          style={{
            padding: 48,
            textAlign: 'center',
            background:
              'linear-gradient(160deg, rgba(78,205,196,0.06), transparent 60%), var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="display" style={{ fontSize: 34, fontWeight: 600, margin: '0 0 12px' }}>
            Ready to look at your writing?
          </h2>
          <p className="muted" style={{ fontSize: 16, maxWidth: 520, margin: '0 auto 24px' }}>
            Paste an essay or a paragraph. The analyzer runs locally - nothing is stored.
          </p>
          <button className="btn btn-primary" onClick={() => setPage('analyzer')}>
            Open the Analyzer <IcoArrow size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
