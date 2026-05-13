import React from 'react';

const Ico = ({ children, size = 18, ...p }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {children}
  </svg>
);

export const IcoUpload = (p) => <Ico {...p}><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Ico>;
export const IcoSearch = (p) => <Ico {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></Ico>;
export const IcoChart  = (p) => <Ico {...p}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15v-4" /><path d="M12 15V8" /><path d="M16 15v-6" /></Ico>;
export const IcoArrow  = (p) => <Ico {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Ico>;
export const IcoCheck  = (p) => <Ico {...p}><path d="m5 12 5 5 9-11" /></Ico>;
export const IcoWarn   = (p) => <Ico {...p}><path d="M12 9v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /><path d="M10.6 3.6 2.7 17.4A1.6 1.6 0 0 0 4.1 20h15.8a1.6 1.6 0 0 0 1.4-2.6L13.4 3.6a1.6 1.6 0 0 0-2.8 0Z" /></Ico>;
export const IcoInfo   = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></Ico>;
export const IcoFile   = (p) => <Ico {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></Ico>;
export const IcoLens   = (p) => <Ico {...p}><circle cx="11" cy="11" r="7" /><circle cx="11" cy="11" r="3" /><path d="m20 20-3.5-3.5" /></Ico>;
export const IcoSpark  = (p) => <Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Ico>;
export const IcoGit    = (p) => <Ico {...p}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0 1 12 6.8c.85.004 1.7.115 2.5.34 1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.41.1 2.66.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></Ico>;
export const IcoX      = (p) => <Ico {...p}><path d="M6 6l12 12M18 6 6 18" /></Ico>;
export const IcoText   = (p) => <Ico {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></Ico>;
export const IcoClip   = (p) => <Ico {...p}><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /></Ico>;
