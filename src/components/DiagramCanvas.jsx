import React, { useRef, useCallback } from 'react';
import { geometry, defaultRel } from '../lib/geometry.js';
import { colorFor } from '../lib/colors.js';
import SuggestionPanel from './SuggestionPanel.jsx';

export default function DiagramCanvas({
  participants,
  meId,
  result,
  resultLoading,
  addItem,
  removeItem,
  startDrag,
  updateItemPosition,
  onDiagramRef,
  expanded,
  onToggleExpand,
  setParticipants,
  team,
  scheduleSuggestions,
}) {
  const diagRef = useRef(null);

  const setRef = useCallback((el) => {
    diagRef.current = el;
    if (onDiagramRef) onDiagramRef(el);
  }, [onDiagramRef]);

  const n = participants.length || 1;
  const geo = geometry(n);
  const { S, C, R, centers } = geo;

  const handlePointerDown = useCallback((e, participantIdx, itemId) => {
    e.preventDefault();
    startDrag(itemId);

    const c = centers[participantIdx];

    const move = (ev) => {
      if (!diagRef.current) return;
      const rect = diagRef.current.getBoundingClientRect();
      const sx = rect.width / S;
      const sy = rect.height / S;
      const px = (ev.clientX - rect.left) / sx;
      const py = (ev.clientY - rect.top) / sy;
      let rx = (px - c.x) / R;
      let ry = (py - c.y) / R;
      const m = Math.hypot(rx, ry);
      const max = 0.82;
      if (m > max) {
        rx = rx / m * max;
        ry = ry / m * max;
      }

      setParticipants(prev => prev.map((p, pi) => {
        if (pi !== participantIdx) return p;
        return {
          ...p,
          items: p.items.map(it => it.id === itemId ? { ...it, rx, ry } : it),
        };
      }));
    };

    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);

      if (!diagRef.current) return;
      const rect = diagRef.current.getBoundingClientRect();
      const sx = rect.width / S;
      const sy = rect.height / S;
      const px = (ev.clientX - rect.left) / sx;
      const py = (ev.clientY - rect.top) / sy;
      let rx = (px - c.x) / R;
      let ry = (py - c.y) / R;
      const m = Math.hypot(rx, ry);
      const max = 0.82;
      if (m > max) {
        rx = rx / m * max;
        ry = ry / m * max;
      }
      updateItemPosition(itemId, rx, ry);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [centers, S, R, startDrag, updateItemPosition, setParticipants]);

  const eligible = participants.filter(p => p.items.length > 0).length >= 2;

  return (
    <div
      ref={setRef}
      style={{ position: 'relative', width: S, height: S, flex: '0 0 auto' }}
    >
      {/* Circles */}
      {participants.map((p, pi) => {
        const col = colorFor(pi);
        const c = centers[pi];
        const active = p.id === meId;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: R * 2,
              height: R * 2,
              left: c.x,
              top: c.y,
              transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              background: active ? col.fillActive : col.fill,
              border: `1.5px solid ${col.stroke}`,
              mixBlendMode: 'multiply',
              transition: 'background .3s ease',
            }}
          />
        );
      })}

      {/* Labels */}
      {participants.map((p, pi) => {
        const col = colorFor(pi);
        const c = centers[pi];
        const active = p.id === meId;
        let ox, oy;
        if (geo.n === 1) { ox = 0; oy = -1; }
        else { ox = Math.cos(c.ang); oy = Math.sin(c.ang); }
        const lx = c.x + ox * (R + 22);
        const ly = c.y + oy * (R + 22);
        const sub = active ? 'you · editing' : `${p.items.length} item${p.items.length === 1 ? '' : 's'}`;

        return (
          <div
            key={p.id + '_label'}
            style={{
              position: 'absolute',
              left: lx,
              top: ly,
              transform: 'translate(-50%,-50%)',
              textAlign: 'center',
              color: col.solid,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em' }}>{p.name}</div>
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 9.5,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              opacity: 0.75,
              marginTop: 1,
            }}>
              {sub}
            </div>
          </div>
        );
      })}

      {/* Chips */}
      {participants.map((p, pi) => {
        const col = colorFor(pi);
        const c = centers[pi];
        const active = p.id === meId;

        return p.items.map((it, idx) => {
          const rp = (it.rx != null)
            ? { rx: it.rx, ry: it.ry }
            : defaultRel(c, idx, p.items.length, geo.n);
          const x = c.x + rp.rx * R;
          const y = c.y + rp.ry * R;

          return (
            <div
              key={p.id + '/' + it.id}
              onPointerDown={active ? (e) => handlePointerDown(e, pi, it.id) : undefined}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%,-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 9px',
                borderRadius: 8,
                background: '#fff',
                border: `1px solid ${active ? col.stroke : '#E2E1DC'}`,
                color: '#26261F',
                fontSize: 13,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(20,20,10,.09)',
                cursor: active ? 'grab' : 'default',
                opacity: active ? 1 : 0.8,
                zIndex: 5,
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              <span>{it.text}</span>
              {active && (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); removeItem(it.id); }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#BDBCB4',
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                    margin: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        });
      })}

      {/* Center panel */}
      <div style={{
        position: 'absolute',
        left: C,
        top: C,
        transform: 'translate(-50%,-50%)',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
      }}>
        {!eligible && (
          <div style={{
            padding: '10px 16px',
            border: '1px dashed #D2D1C9',
            borderRadius: 999,
            fontSize: 12,
            color: '#A8A79F',
            background: 'rgba(250,250,249,.7)',
            whiteSpace: 'nowrap',
          }}>
            {participants.length <= 1 ? 'common ground appears here' : 'fill two or more circles'}
          </div>
        )}

        {eligible && resultLoading && !result && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 16px',
            background: '#fff',
            border: '1px solid #ECEBE5',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(20,20,10,.1)',
            fontSize: 12.5,
            color: '#6E6D65',
            whiteSpace: 'nowrap',
          }}>
            <span>weighing everyone's picks</span>
            <span style={{ display: 'inline-flex', gap: 3 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite' }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite .2s' }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9A998F', animation: 'vdots 1.2s infinite .4s' }} />
            </span>
          </div>
        )}

        {eligible && result && result.length > 0 && (
          <SuggestionPanel
            suggestions={result}
            expanded={expanded}
            onToggle={onToggleExpand}
            updating={resultLoading}
          />
        )}
      </div>
    </div>
  );
}
