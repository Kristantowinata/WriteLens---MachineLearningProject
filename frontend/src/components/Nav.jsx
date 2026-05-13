import React from 'react';

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'analyzer', label: 'Analyzer' },
  { id: 'about', label: 'About' },
];

export default function Nav({ page, setPage }) {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark" />
          WriteLens
        </div>
        <div className="nav-links">
          {ITEMS.map((i) => (
            <div
              key={i.id}
              className={`nav-link ${page === i.id ? 'active' : ''}`}
              onClick={() => setPage(i.id)}
            >
              {i.label}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
