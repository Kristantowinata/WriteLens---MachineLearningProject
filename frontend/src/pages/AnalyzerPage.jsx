import React, { useState, useMemo, useEffect } from 'react';
import mammoth from 'mammoth';
import { IcoText, IcoUpload, IcoLens, IcoWarn, IcoCheck, IcoInfo } from '../components/icons.jsx';
import { Stat } from '../components/shared.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import FeatureRow from '../components/FeatureRow.jsx';
import RadarChart from '../components/RadarChart.jsx';
import { analyzeText as analyzeTextAPI } from '../services/api.js';
import {
  analyzeTextLocal,
  generateInsightsLocal,
} from '../utils/analyzeLocal.js';

const SAMPLE_TEXT = `The development of artificial intelligence has fundamentally changed how we approach problem solving in modern society. Many people believe AI will replace jobs. Others think it will create new opportunities. The reality is more complex.

When students write essays, they often follow a structure they learned in school. This structure tends to be predictable. It uses certain patterns that AI models also learned. As a result, well-structured student writing can look similar to AI-generated text in some statistical measures.

This is especially true for non-native English writers. Their vocabulary may be more limited. Their sentence structures may be more uniform. These traits do not mean the writing is artificial. They reflect the writer's level of language acquisition, not the source of the text.`;

function LoadingResults() {
  const steps = [
    'Tokenizing text...',
    'Computing lexical features...',
    'Extracting sentence statistics...',
    'Scoring against human/AI distributions...',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => Math.min(x + 1, steps.length - 1)), 350);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="card card-pad" style={{ padding: 48, textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'rgba(78,205,196,.08)',
          border: '1px solid rgba(78,205,196,.25)',
          margin: '0 auto 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          animation: 'spin 2s linear infinite',
        }}
      >
        <IcoLens size={24} />
      </div>
      <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 10px' }}>
        Analyzing your writing
      </h3>
      <p className="mono" style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
        {steps[i]}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 22 }}>
        {steps.map((_, k) => (
          <div
            key={k}
            style={{
              width: 28,
              height: 3,
              borderRadius: 2,
              background: k <= i ? 'var(--accent)' : 'var(--border-2)',
              transition: 'background .2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Results({ result }) {
  const { aiProb, features, wordCount, sentenceCount, insights } = result;
  const zone = result.zone || (aiProb < 35 ? 'human' : aiProb < 65 ? 'ambiguous' : 'ai');
  const zoneText =
    result.zoneLabel ||
    (zone === 'human'
      ? 'Likely human'
      : zone === 'ambiguous'
      ? 'Ambiguous zone'
      : 'AI-like patterns');
  const zoneDesc =
    result.zoneDesc ||
    (zone === 'human'
      ? 'Most features sit inside typical human ranges.'
      : zone === 'ambiguous'
      ? 'Some features resemble AI patterns — common for non-native or formal writing.'
      : 'Several features overlap with patterns AI models tend to produce.');
  const tagClass =
    zone === 'human' ? 'tag-human' : zone === 'ai' ? 'tag-ai' : 'tag-ambig';

  // Use backend insights if available, otherwise generate locally
  const displayInsights =
    insights && insights.length > 0 ? insights : generateInsightsLocal(result);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Score card */}
      <div
        className="card"
        style={{
          padding: 36,
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <ScoreRing value={aiProb} />
        <div>
          <span className={`score-tag ${tagClass}`}>{zoneText}</span>
          <h2
            className="display"
            style={{ fontSize: 32, fontWeight: 600, margin: '16px 0 10px', lineHeight: 1.15 }}
          >
            {zone === 'human' && 'Your writing reads as human.'}
            {(zone === 'ambiguous' || zone === 'ambig') &&
              'Your writing sits in the ambiguous zone.'}
            {zone === 'ai' && 'Your writing overlaps AI patterns.'}
          </h2>
          <p
            className="muted"
            style={{ fontSize: 15, lineHeight: 1.65, margin: '0 0 20px', maxWidth: 520 }}
          >
            {zoneDesc}
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Stat label="Words" value={wordCount} />
            <Stat label="Sentences" value={sentenceCount} />
            <Stat label="Features analyzed" value={features.length} />
          </div>
          <div className="insight" style={{ marginTop: 22, background: 'rgba(255,255,255,.02)' }}>
            <div
              className="insight-ico"
              style={{ background: 'rgba(240,192,90,.08)', color: 'var(--amber)' }}
            >
              <IcoInfo size={16} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)', fontWeight: 500 }}>
                For self-assessment only.
              </strong>{' '}
              This score is not definitive proof of authorship and should not be used to accuse or
              grade students.
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {displayInsights.length > 0 && (
        <div>
          <h3 className="display" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 14px' }}>
            Key insights
          </h3>
          <div className="grid-3">
            {displayInsights.map((ins, i) => {
              const cfg =
                ins.kind === 'warn'
                  ? {
                      ico: <IcoWarn size={16} />,
                      c: 'var(--ai)',
                      bg: 'rgba(244,124,124,.08)',
                    }
                  : ins.kind === 'good'
                  ? {
                      ico: <IcoCheck size={16} />,
                      c: 'var(--human)',
                      bg: 'rgba(94,224,160,.08)',
                    }
                  : {
                      ico: <IcoInfo size={16} />,
                      c: 'var(--accent)',
                      bg: 'rgba(78,205,196,.08)',
                    };
              return (
                <div key={i} className="insight">
                  <div className="insight-ico" style={{ background: cfg.bg, color: cfg.c }}>
                    {cfg.ico}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6 }}>
                    {ins.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature breakdown */}
      <div className="card card-pad" style={{ padding: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
        <div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              What our model sees in your writing
            </h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              Each feature shows where your writing falls on the human ↔ AI spectrum.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 6 }}>
            <span style={{ color: 'var(--human)', fontSize: 12 }}>🟢 Human</span>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>←→</span>
            <span style={{ color: 'var(--ai)', fontSize: 12 }}>🔴 AI</span>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          {features.map(f => (
            <FeatureRow key={f.key} f={f} />
          ))}
        </div>
      </div>

      {/* Radar chart */}
      <div className="card card-pad" style={{ padding: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              Stylometric fingerprint
            </h3>
            <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 460 }}>
              Your text plotted against the average human and AI profiles across all measured
              features.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
            <span className="legend-row">
              <span
                className="legend-sw"
                style={{ background: 'var(--accent)', height: 8, width: 18, borderRadius: 4 }}
              />
              Your text
            </span>
            <span className="legend-row">
              <span
                className="legend-sw"
                style={{ background: 'var(--human)', opacity: 0.8, height: 2 }}
              />
              Avg human (dashed)
            </span>
            <span className="legend-row">
              <span
                className="legend-sw"
                style={{ background: 'var(--ai)', opacity: 0.8, height: 2 }}
              />
              Avg AI (dashed)
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 8px' }}>
          <RadarChart features={features} size={400} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyzerPage() {
  const [tab, setTab] = useState('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const wordCount = useMemo(() => (text.match(/[A-Za-z']+/g) || []).length, [text]);
  const canAnalyze = wordCount >= 20;

  const onAnalyze = async () => {
    if (!canAnalyze) return;
    setState('loading');
    setResult(null);
    setError(null);

    try {
      // Try backend API first
      const data = await analyzeTextAPI(text);
      setResult(data);
      setState('done');
    } catch (err) {
      // Fallback to local analysis
      console.warn('Backend unreachable, using local analysis:', err.message);
      const localResult = analyzeTextLocal(text);
      if (localResult) {
        localResult.insights = generateInsightsLocal(localResult);
        setResult(localResult);
        setState('done');
      } else {
        setError('Analysis failed. Please try again.');
        setState('idle');
      }
    }
  };

  const onSample = () => {
    setText(SAMPLE_TEXT);
    setTab('paste');
  };

  const onFile = async (file) => {
    if (!file) return;
    if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
        setFileName(file.name);
      } catch {
        setError('Failed to read .docx file.');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(String(e.target.result || ''));
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="page-enter">
      <section className="container" style={{ paddingTop: 56, paddingBottom: 24 }}>
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
            - Analyzer
          </div>
          <h1 className="display" style={{ fontSize: 44, fontWeight: 600, margin: '0 0 14px' }}>
            Analyze your writing
          </h1>
          <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Paste an essay or upload a document. We'll surface the stylometric features that
            AI detectors pay attention to - and show you where your writing falls relative to
            typical human and AI ranges.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 48 }}>
        <div className="card card-pad" style={{ padding: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div className="tabs">
              <div
                className={`tab ${tab === 'paste' ? 'active' : ''}`}
                onClick={() => setTab('paste')}
              >
                <IcoText size={14} /> Paste Text
              </div>
              <div
                className={`tab ${tab === 'upload' ? 'active' : ''}`}
                onClick={() => setTab('upload')}
              >
                <IcoUpload size={14} /> Upload File
              </div>
            </div>
            <button
              className="link"
              onClick={onSample}
              style={{ background: 'none', border: 0, fontSize: 13, fontFamily: 'inherit', padding: 0 }}
            >
              ✨ Try with sample text
            </button>
          </div>

          {tab === 'paste' ? (
            <div>
              <textarea
                className="ta"
                placeholder="Paste your essay or writing here..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  fontSize: 12,
                  color: 'var(--text-3)',
                }}
              >
                <span className="mono">
                  <span style={{ color: wordCount >= 20 ? 'var(--text-2)' : 'var(--ambig)' }}>
                    {wordCount}
                  </span>{' '}
                  words - {text.length} chars
                  {!canAnalyze && wordCount > 0 && (
                    <span style={{ marginLeft: 10, color: 'var(--ambig)' }}>
                      - min 20 words
                    </span>
                  )}
                </span>
                <span>We don't store any text. Analysis runs in your browser.</span>
              </div>
            </div>
          ) : (
            <div
              className={`dz ${drag ? 'drag' : ''}`}
              onDragOver={e => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => {
                e.preventDefault();
                setDrag(false);
                onFile(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById('fileinput').click()}
            >
              <input
                id="fileinput"
                type="file"
                accept=".txt,.docx,.md"
                hidden
                onChange={e => onFile(e.target.files[0])}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <IcoUpload size={22} />
              </div>
              {fileName ? (
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
                    {fileName}
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {wordCount} words detected - click to replace
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 6, fontSize: 15 }}
                  >
                    Drop your file here, or click to browse
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    Supports .txt, .docx, .md - up to 10MB
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-banner" style={{ marginTop: 14 }}>
              <IcoInfo size={16} />
              <span>{error}</span>
            </div>
          )}

          <div
            style={{
              marginTop: 22,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {text && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setText('');
                  setFileName('');
                  setResult(null);
                  setState('idle');
                  setError(null);
                }}
                style={{ padding: '11px 14px' }}
              >
                Clear
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={onAnalyze}
              disabled={!canAnalyze || state === 'loading'}
              style={{
                opacity: !canAnalyze || state === 'loading' ? 0.55 : 1,
                cursor: !canAnalyze || state === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {state === 'loading' ? (
                <>
                  <span className="spinner" /> Analyzing...
                </>
              ) : (
                <>
                  <IcoLens size={16} /> Analyze Writing
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {state === 'loading' && (
        <section className="container" style={{ paddingBottom: 96 }}>
          <LoadingResults />
        </section>
      )}

      {state === 'done' && result && (
        <section className="container" style={{ paddingBottom: 96 }}>
          <Results result={result} />
        </section>
      )}
    </div>
  );
}
