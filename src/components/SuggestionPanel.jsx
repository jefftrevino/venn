import React from 'react';

export default function SuggestionPanel({ suggestions, expanded, onToggle, updating }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 236,
        padding: '15px 17px',
        background: '#fff',
        border: '1px solid #ECEBE5',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(20,20,10,.13)',
        textAlign: 'left',
        cursor: 'pointer',
        animation: 'vfade .2s ease',
      }}
    >
      <div style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 9.5,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: '#B0AFA8',
        marginBottom: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>you'd all go for</span>
        {updating && <span style={{ color: '#C7C6BE' }}>· updating</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {suggestions.map((sg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#1B1B19',
                flex: '0 0 auto',
                transform: 'translateY(-2px)',
                display: 'inline-block',
              }} />
              <span style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '-.01em',
                lineHeight: 1.2,
              }}>
                {sg.label}
              </span>
            </div>
            {expanded && (
              <div style={{
                fontSize: 11.5,
                color: '#8A8A82',
                lineHeight: 1.45,
                paddingLeft: 13,
              }}>
                {sg.why}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 9.5,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#C7C6BE',
        marginTop: 12,
      }}>
        {expanded ? 'tap to hide why' : 'tap to see why'}
      </div>
    </div>
  );
}
