import React from 'react';
import { IcoGit } from './icons.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark" style={{ width: 18, height: 18 }} />
          <span>WriteLens - ML Final Project - BINUS University - 2026</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <a
            href="https://github.com/Kristantowinata/WriteLens---MachineLearningProject.git"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
          >
            <IcoGit size={14} /> GitHub
          </a>
          <span>v0.1 - Educational tool, not a verdict</span>
        </div>
      </div>
    </footer>
  );
}
