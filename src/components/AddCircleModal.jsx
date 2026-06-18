import React, { useState } from 'react';

export default function AddCircleModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');

  const canAdd = !!name.trim();

  const handleConfirm = () => {
    if (!canAdd) return;
    onConfirm(name.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,27,25,.32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'vfade .14s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 340,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(20,20,10,.24)',
          padding: 24,
        }}
      >
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          letterSpacing: '.14em',
          color: '#B0AFA8',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Add a circle
        </div>

        <div style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-.01em',
          marginBottom: 5,
        }}>
          Who's joining?
        </div>

        <div style={{
          fontSize: 13,
          color: '#9A998F',
          lineHeight: 1.5,
          marginBottom: 18,
        }}>
          Adds a new circle in this window and switches you to it — handy for trying the diagram solo.
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Their name"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 13px',
            fontSize: 15,
            border: '1px solid #E4E3DD',
            borderRadius: 9,
            outline: 'none',
            marginBottom: 16,
          }}
        />

        <div style={{ display: 'flex', gap: 9 }}>
          <button
            onClick={onClose}
            style={{
              flex: '0 0 auto',
              padding: '11px 16px',
              fontSize: 14,
              color: '#6E6D65',
              background: '#F6F5F1',
              border: 'none',
              borderRadius: 9,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: 11,
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              background: '#1B1B19',
              border: 'none',
              borderRadius: 9,
              cursor: 'pointer',
              opacity: canAdd ? 1 : 0.4,
            }}
          >
            Add circle
          </button>
        </div>
      </div>
    </div>
  );
}
