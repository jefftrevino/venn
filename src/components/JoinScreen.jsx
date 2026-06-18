import React, { useState } from 'react';

export default function JoinScreen({ team, joinTeam }) {
  const [name, setName] = useState('');

  const canJoin = !!name.trim();

  const handleJoin = () => {
    if (!canJoin) return;
    joinTeam(name.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  const teamName = team ? team.name : '';

  return (
    <div style={{
      flex: 1,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{ width: 380 }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11,
          letterSpacing: '.16em',
          color: '#A4A39C',
          textTransform: 'uppercase',
          marginBottom: 18,
        }}>
          You're invited
        </div>

        <h1 style={{
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-.02em',
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}>
          Join{' '}
          <span style={{ color: 'oklch(0.56 0.16 255)' }}>{teamName}</span>
        </h1>

        <p style={{
          fontSize: 15,
          color: '#8A8A82',
          margin: '0 0 30px',
          lineHeight: 1.5,
        }}>
          You'll get your own circle in the team's diagram. Fill it in and watch the overlap appear with everyone else's.
        </p>

        <label style={{
          display: 'block',
          fontSize: 12,
          color: '#8A8A82',
          marginBottom: 7,
        }}>
          Your name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Priya"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 13px',
            fontSize: 15,
            border: '1px solid #E4E3DD',
            borderRadius: 9,
            background: '#fff',
            outline: 'none',
            marginBottom: 24,
          }}
        />

        <button
          onClick={handleJoin}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 15,
            fontWeight: 500,
            color: '#fff',
            background: '#1B1B19',
            border: 'none',
            borderRadius: 9,
            cursor: 'pointer',
            opacity: canJoin ? 1 : 0.4,
          }}
        >
          Join the diagram
        </button>
      </div>
    </div>
  );
}
