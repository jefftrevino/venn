import React from 'react';

export default function InvitePopover({ link, copyLabel, onCopy, onOpenCollabWindow, onAddCircle }) {
  return (
    <div style={{
      position: 'absolute',
      top: 42,
      right: 0,
      width: 288,
      background: '#fff',
      border: '1px solid #ECEBE5',
      borderRadius: 12,
      boxShadow: '0 12px 32px rgba(20,20,10,.12)',
      padding: 16,
      zIndex: 50,
      animation: 'vfade .14s ease',
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
        Invite your team
      </div>
      <div style={{
        fontSize: 12,
        color: '#9A998F',
        lineHeight: 1.45,
        marginBottom: 12,
      }}>
        Each person who joins gets their own circle — edits sync live both ways. Open a collaborator window to see it here.
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 11px',
        background: '#F6F5F1',
        borderRadius: 8,
        marginBottom: 11,
      }}>
        <span style={{
          flex: 1,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: '#54534C',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {link}
        </span>
        <button
          onClick={onCopy}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#fff',
            background: '#1B1B19',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            cursor: 'pointer',
            flex: '0 0 auto',
          }}
        >
          {copyLabel}
        </button>
      </div>

      <button
        onClick={onOpenCollabWindow}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          fontSize: 12.5,
          fontWeight: 500,
          color: '#1B1B19',
          background: '#fff',
          border: '1px solid #E4E3DD',
          borderRadius: 8,
          padding: '9px 11px',
          cursor: 'pointer',
          marginBottom: 8,
        }}
      >
        <span>Open a collaborator window</span>
        <span style={{ color: '#9A998F' }}>↗</span>
      </button>

      <button
        onClick={onAddCircle}
        style={{
          width: '100%',
          textAlign: 'left',
          fontSize: 12,
          color: '#9A998F',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 0 0',
        }}
      >
        +&nbsp;&nbsp;Add a circle in this window
      </button>
    </div>
  );
}
