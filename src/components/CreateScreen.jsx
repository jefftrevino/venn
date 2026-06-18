import React, { useState } from 'react';

export default function CreateScreen({ notFound, createTeam }) {
  const [teamName, setTeamName] = useState('');
  const [yourName, setYourName] = useState('');

  const canCreate = !!(teamName.trim() && yourName.trim());

  const handleCreate = () => {
    if (!canCreate) return;
    createTeam(teamName.trim(), yourName.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleCreate();
  };

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
          Overlap
        </div>

        <h1 style={{
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-.02em',
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}>
          Find what your group<br />has in common.
        </h1>

        <p style={{
          fontSize: 15,
          color: '#8A8A82',
          margin: '0 0 30px',
          lineHeight: 1.5,
        }}>
          Create a team, share one link, and let everyone fill in their own circle. The overlap writes itself.
        </p>

        {notFound && (
          <div style={{
            fontSize: 13,
            color: '#9A5A3A',
            background: '#FBF1EA',
            border: '1px solid #F0DECF',
            borderRadius: 9,
            padding: '11px 13px',
            lineHeight: 1.5,
            marginBottom: 22,
          }}>
            That invite link's team lives in another browser. Invite links sync within the same browser — open the link in a new tab of the browser that created the team. Or start your own below.
          </div>
        )}

        <label style={{
          display: 'block',
          fontSize: 12,
          color: '#8A8A82',
          marginBottom: 7,
        }}>
          Team name
        </label>
        <input
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. The Wednesday Band"
          style={{
            width: '100%',
            padding: '11px 13px',
            fontSize: 15,
            border: '1px solid #E4E3DD',
            borderRadius: 9,
            background: '#fff',
            outline: 'none',
            marginBottom: 16,
          }}
        />

        <label style={{
          display: 'block',
          fontSize: 12,
          color: '#8A8A82',
          marginBottom: 7,
        }}>
          Your name
        </label>
        <input
          value={yourName}
          onChange={e => setYourName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Mateo"
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
          onClick={handleCreate}
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
            opacity: canCreate ? 1 : 0.4,
          }}
        >
          Create team &amp; get invite link
        </button>
      </div>
    </div>
  );
}
