import React from 'react';
import { useTeam } from './hooks/useTeam.js';
import CreateScreen from './components/CreateScreen.jsx';
import JoinScreen from './components/JoinScreen.jsx';
import AppScreen from './components/AppScreen.jsx';

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '100vh',
    }}>
      <span style={{ display: 'inline-flex', gap: '5px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite .2s' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite .4s' }} />
      </span>
    </div>
  );
}

export default function App() {
  const teamState = useTeam();
  const { step } = teamState;

  if (step === 'loading') return <LoadingSpinner />;
  if (step === 'create') return <CreateScreen {...teamState} />;
  if (step === 'join') return <JoinScreen {...teamState} />;
  if (step === 'app') return <AppScreen {...teamState} />;

  return <LoadingSpinner />;
}
