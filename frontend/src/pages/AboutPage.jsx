import React, { useState } from 'react';
import { IcoArrow, IcoWarn } from '../components/icons.jsx';
import { SectionEyebrow } from '../components/shared.jsx';

const FEATURES = [
  {
    name: 'Average Sentence Length',
    desc: 'Mean number of words per sentence. AI-generated text tends to cluster around longer, uniform sentences (18–26 words).',
  },
  {
    name: 'Lexical Diversity (TTR)',
    desc: "Type-Token Ratio — the count of unique words divided by the total word count. Lower diversity is associated with both AI generation and second-language writing.",
  },
  {
    name: 'Vocabulary Richness',
    desc: 'Proportion of hapax legomena — words appearing exactly once. Reflects vocabulary breadth and is one of the most discriminative stylometric features.',
  },
  {
    name: 'Sentence Length Variance',
    desc: 'Standard deviation of sentence lengths. Human writers vary rhythm intentionally; AI tends toward uniform pacing.',
  },
  {
    name: 'Punctuation Density',
    desc: 'Punctuation marks per word. Distinct dialect and rhetorical habits show up here — em-dashes, semicolons, parentheticals.',
  },
  {
    name: 'Function-Word Ratio',
    desc: 'Share of high-frequency stopwords (the, of, and, …). A classical authorship-attribution signal.',
  },
];

export default function AboutPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="container" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div style={{ maxWidth: 760 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--accent)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            &mdash; About
          </div>
          <h1 className="display" style={{ fontSize: 44, fontWeight: 600, margin: '0 0 18px' }}>
            Methodology &amp; transparency
          </h1>
          <p className="muted" style={{ fontSize: 17, lineHeight: 1.65 }}>
            WriteLens is a research-grade self-assessment tool built as a final project for the
            Machine Learning course at BINUS University. Its goal is educational: to make the
            features inside an AI-detection model visible to the writers they affect.
          </p>
        </div>
      </section>

      {/* Motivation + What it is */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <div className="grid-2">
          <div className="card card-pad" style={{ padding: 28 }}>
            <span className="pill" style={{ marginBottom: 14 }}>
              <span
                className="dot"
                style={{ background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)' }}
              />
              Motivation
            </span>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 12px' }}>
              Why we built this
            </h3>
            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
              In 2023, Stanford researchers found AI detectors flagged 61% of TOEFL essays by
              non-native English students as AI-generated. The pattern wasn&rsquo;t malice &mdash; it
              was statistics. Detectors were trained on native English writing and learned that
              &ldquo;less varied vocabulary&rdquo; and &ldquo;uniform sentences&rdquo; correlate with
              AI. Those traits also correlate with learning English as a second language. WriteLens
              makes that overlap visible.
            </p>
          </div>
          <div className="card card-pad" style={{ padding: 28 }}>
            <span className="pill" style={{ marginBottom: 14 }}>
              <span className="dot" />
              What it is
            </span>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 12px' }}>
              A lens, not a verdict
            </h3>
            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
              WriteLens does not claim to detect AI writing accurately. It shows which features in
              your text resemble AI patterns and which don&rsquo;t, against published distributions.
              The intent is to give writers &mdash; especially non-native ones &mdash; a vocabulary
              for discussing their own style and the limits of automated detection.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <SectionEyebrow eyebrow="Methodology" title="How analysis works" />
        <div className="grid-3" style={{ marginTop: 36 }}>
          {[
            {
              n: '01',
              t: 'Model',
              body: 'Classical ML classifier (logistic regression with stylometric features). The full architecture and weights will be published with the project report.',
            },
            {
              n: '02',
              t: 'Training Data',
              body: 'Combined corpus drawn from DAIGT v2 (Kaggle), the GPT-written essay set, and a balanced sample of human-authored student essays. ~24,000 documents total, split 80/10/10.',
            },
            {
              n: '03',
              t: 'Features',
              body: 'Six stylometric features computed per document — see breakdown below. We deliberately avoid neural perplexity features so results stay interpretable.',
            },
          ].map((c, i) => (
            <div key={i} className="card card-pad" style={{ padding: 26 }}>
              <span
                className="mono"
                style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '.1em' }}
              >
                {c.n}
              </span>
              <h4 className="display" style={{ fontSize: 19, fontWeight: 600, margin: '8px 0 12px' }}>
                {c.t}
              </h4>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature accordion */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>
          The six features explained
        </h3>
        <div className="card" style={{ padding: '0 28px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="acc">
              <div className="acc-h" onClick={() => setOpen(open === i ? -1 : i)}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span className="mono" style={{ color: 'var(--text-3)', fontSize: 12, width: 28 }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{f.name}</span>
                </div>
                <span className={`chev ${open === i ? 'open' : ''}`}>
                  <IcoArrow size={16} />
                </span>
              </div>
              <div
                className={`acc-b ${open === i ? 'open' : ''}`}
                style={{ paddingLeft: 42 }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <div
          className="card"
          style={{
            padding: 32,
            borderColor: 'rgba(244,124,124,.25)',
            background:
              'linear-gradient(160deg, rgba(244,124,124,0.04), transparent 70%), var(--surface)',
          }}
        >
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <div
              style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(244,124,124,.1)',
                border: '1px solid rgba(244,124,124,.3)',
                color: 'var(--ai)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IcoWarn size={20} />
            </div>
            <div>
              <h3
                className="display"
                style={{ fontSize: 22, fontWeight: 600, margin: '0 0 14px' }}
              >
                Limitations &amp; disclaimer
              </h3>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: 'var(--text-2)',
                }}
              >
                <li>
                  &middot;{' '}
                  <strong style={{ color: 'var(--text)' }}>This is not ground truth.</strong> No
                  automated tool can definitively determine whether a piece of text was written by a
                  human or an AI.
                </li>
                <li>
                  &middot;{' '}
                  <strong style={{ color: 'var(--text)' }}>Do not use scores to accuse.</strong>{' '}
                  Stylometric features overlap heavily between AI text and writing by non-native
                  speakers, students, and people with autism or dyslexia.
                </li>
                <li>
                  &middot;{' '}
                  <strong style={{ color: 'var(--text)' }}>Short texts are unreliable.</strong>{' '}
                  Statistical features need at least ~150 words to stabilize. Tweets, paragraphs,
                  and one-liners will produce noise.
                </li>
                <li>
                  &middot;{' '}
                  <strong style={{ color: 'var(--text)' }}>The model has bias.</strong> Training
                  data is predominantly English-language academic writing. Performance on other
                  domains is untested.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <SectionEyebrow eyebrow="Team" title="Who built this" />
        <div className="grid-3" style={{ marginTop: 32 }}>
          {[
            { n: 'Team Member', r: 'Model & ML pipeline', i: 'TM' },
            { n: 'Team Member', r: 'Frontend & UX', i: 'TM' },
            { n: 'Team Member', r: 'Research & data', i: 'TM' },
          ].map((p, i) => (
            <div
              key={i}
              className="card card-pad"
              style={{ display: 'flex', gap: 14, alignItems: 'center' }}
            >
              <div className="avatar">{p.i}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.n}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {p.r}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="dim" style={{ fontSize: 12, marginTop: 16 }}>
          Replace placeholder names with your actual team members before presenting.
        </p>
      </section>
    </div>
  );
}
