import React, { useState, useEffect } from 'react';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AnalyzerPage from './pages/AnalyzerPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

export default function App() {
  const [page, setPage] = useState('home');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);

  return (
    <div>
      <Nav page={page} setPage={setPage} />
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'analyzer' && <AnalyzerPage />}
      {page === 'about' && <AboutPage />}
      <Footer />
    </div>
  );
}
