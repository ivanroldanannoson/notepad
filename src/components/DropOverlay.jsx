import React from 'react';

/**
 * Full-screen overlay shown while the user is dragging files over the app.
 * - isVisible: show/hide
 * - isSupported: true = green/accept, false = red/reject
 * - isDark: theme
 */
export default function DropOverlay({ isVisible, isSupported, isDark }) {
  if (!isVisible) return null;

  const accent = isSupported
    ? 'rgba(34,197,94,0.18)'   // green tint
    : 'rgba(239,68,68,0.18)';  // red tint
  const border = isSupported ? '#22c55e' : '#ef4444';
  const iconColor = isSupported ? '#22c55e' : '#ef4444';
  const label = isSupported ? 'Drop to open' : 'Unsupported file type';
  const sublabel = isSupported
    ? 'Text and code files will open in a new tab'
    : 'Video, audio, image and binary files cannot be opened';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'dropOverlayFadeIn 0.15s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: '40px 56px',
          borderRadius: 20,
          border: `2.5px dashed ${border}`,
          background: accent,
          boxShadow: `0 0 0 1px ${border}22, 0 8px 40px ${border}33`,
          animation: 'dropCardPop 0.18s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {isSupported ? (
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        ) : (
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: iconColor, letterSpacing: '-0.3px' }}>{label}</div>
          <div style={{ fontSize: 13, marginTop: 5, opacity: 0.75, color: isDark ? '#e5e7eb' : '#374151' }}>{sublabel}</div>
        </div>
      </div>

      <style>{`
        @keyframes dropOverlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dropCardPop {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
