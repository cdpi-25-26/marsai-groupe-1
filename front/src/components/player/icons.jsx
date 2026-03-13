export function SeekTenIcon({ forward = false, size = 38 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="white">
      <path d={forward
        ? "M28 18A12 12 0 1 1 16 6h4V1L26 7l-6 6V8h-4A10 10 0 1 0 26 18Z"
        : "M4 18A12 12 0 1 0 16 6h-4V1L6 7l6 6V8h4A10 10 0 1 1 6 18Z"
      }/>
      <path d="M19.63 22.13a2.84 2.84 0 0 1-1.28-.27a2.44 2.44 0 0 1-.89-.77a3.6 3.6 0 0 1-.52-1.25a7.7 7.7 0 0 1-.17-1.68a8 8 0 0 1 .17-1.68a3.7 3.7 0 0 1 .52-1.25a2.44 2.44 0 0 1 .89-.77a2.84 2.84 0 0 1 1.28-.27a2.44 2.44 0 0 1 2.16 1a5.23 5.23 0 0 1 .7 2.93a5.23 5.23 0 0 1-.7 2.93a2.44 2.44 0 0 1-2.16 1.08m0-1.22a1.07 1.07 0 0 0 1-.55a3.4 3.4 0 0 0 .37-1.51v-1.38a3.3 3.3 0 0 0-.29-1.5a1.23 1.23 0 0 0-2.06 0a3.3 3.3 0 0 0-.29 1.5v1.38a3.4 3.4 0 0 0 .29 1.51a1.06 1.06 0 0 0 .98.55m-9 1.09v-1.18h2v-5.19l-1.86 1l-.55-1.06l2.32-1.3H14v6.5h1.78V22z"/>
    </svg>
  );
}

export function PipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" />
      <rect x="12" y="10" width="8" height="6" rx="1.5" fill="white" />
    </svg>
  );
}

export function AirPlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <polyline points="12,15 17,21 7,21" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
      <path d="M12 12 L16.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="white" />
      <path d="M6.5 16.5 a7.5 7.5 0 0 1 11 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SubtitleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="white" strokeWidth="1.8" />
      <line x1="6" y1="11" x2="18" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="15" x2="14" y2="15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
