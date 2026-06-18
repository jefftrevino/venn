import React, { useState, useRef, useCallback } from 'react';
import { colorFor } from '../lib/colors.js';
import DiagramCanvas from './DiagramCanvas.jsx';
import InvitePopover from './InvitePopover.jsx';
import AddCircleModal from './AddCircleModal.jsx';

export default function AppScreen({
  team,
  participants,
  meId,
  result,
  resultLoading,
  addItem,
  removeItem,
  startDrag,
  updateItemPosition,
  setActive,
  joinTeam,
  shareLink,
  setParticipants,
  scheduleSuggestions,
}) {
  const [draft, setDraft] = useState('');
  const [invitePopover, setInvitePopover] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [expanded, setExpanded] = useState(false);
  const copyTimerRef = useRef(null);
  const diagRef = useRef(null);

  const activePart = participants.find(p => p.id === meId);
  const activeName = activePart ? activePart.name : '';

  const handleAddItem = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    addItem(t);
    setDraft('');
  }, [draft, addItem]);

  const handleDraftKey = useCallback((e) => {
    if (e.key === 'Enter') handleAddItem();
  }, [handleAddItem]);

  const copyLink = useCallback(() => {
    try { navigator.clipboard.writeText(shareLink); } catch (e) {}
    setCopyLabel('Copied');
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyLabel('Copy'), 1600);
  }, [shareLink]);

  const handleOpenCollabWindow = useCallback(() => {
    window.open(shareLink, '_blank');
    setInvitePopover(false);
  }, [shareLink]);

  const handleAddCircle = useCallback(() => {
    setInvitePopover(false);
    setAddOpen(true);
  }, []);

  const handleConfirmAdd = useCallback((name) => {
    joinTeam(name);
    setAddOpen(false);
  }, [joinTeam]);

  const handleDiagramRef = useCallback((el) => {
    diagRef.current = el;
  }, []);

  // Close invite popover when clicking outside
  const handleOverlayClick = useCallback((e) => {
    if (invitePopover) setInvitePopover(false);
  }, [invitePopover]);

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      onClick={handleOverlayClick}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 22px',
        borderBottom: '1px solid #ECEBE5',
        position: 'relative',
        zIndex: 400,
        background: '#FAFAF9',
      }}>
        {/* Left: team name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>
            {team ? team.name : ''}
          </span>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            letterSpacing: '.14em',
            color: '#B0AFA8',
            textTransform: 'uppercase',
          }}>
            team
          </span>
        </div>

        {/* Right: avatars + invite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {participants.map((p, pi) => {
              const col = colorFor(pi);
              const active = p.id === meId;
              return (
                <div
                  key={p.id}
                  onClick={(e) => { e.stopPropagation(); setActive(p.id); }}
                  title={p.name}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    background: col.solid,
                    cursor: 'pointer',
                    marginLeft: pi === 0 ? 0 : -6,
                    boxShadow: active
                      ? `0 0 0 2px #FAFAF9, 0 0 0 4px ${col.solid}`
                      : '0 0 0 2px #FAFAF9',
                    position: 'relative',
                    zIndex: active ? 2 : 1,
                  }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
              );
            })}
          </div>

          {/* Invite button + popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setInvitePopover(v => !v); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: '#1B1B19',
                background: '#fff',
                border: '1px solid #E4E3DD',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Invite
            </button>

            {invitePopover && (
              <InvitePopover
                link={shareLink}
                copyLabel={copyLabel}
                onCopy={copyLink}
                onOpenCollabWindow={handleOpenCollabWindow}
                onAddCircle={handleAddCircle}
              />
            )}
          </div>
        </div>
      </div>

      {/* Invite banner (only 1 participant) */}
      {participants.length === 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 10,
          background: '#F6F5F1',
          borderBottom: '1px solid #ECEBE5',
          fontSize: 13,
          color: '#6E6D65',
        }}>
          <span>Your team is empty — share this link so others can add their circle:</span>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12,
            color: '#1B1B19',
          }}>
            {shareLink}
          </span>
          <button
            onClick={copyLink}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#1B1B19',
              background: '#fff',
              border: '1px solid #E4E3DD',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            {copyLabel}
          </button>
        </div>
      )}

      {/* Diagram area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        overflow: 'hidden',
      }}>
        <DiagramCanvas
          participants={participants}
          meId={meId}
          result={result}
          resultLoading={resultLoading}
          addItem={addItem}
          removeItem={removeItem}
          startDrag={startDrag}
          updateItemPosition={updateItemPosition}
          onDiagramRef={handleDiagramRef}
          expanded={expanded}
          onToggleExpand={() => setExpanded(v => !v)}
          setParticipants={setParticipants}
          team={team}
          scheduleSuggestions={scheduleSuggestions}
        />
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 24px 26px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 480,
          maxWidth: '100%',
          padding: '7px 7px 7px 16px',
          background: '#fff',
          border: '1px solid #E4E3DD',
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(20,20,10,.04)',
        }}>
          <span style={{
            fontSize: 13,
            color: '#9A998F',
            whiteSpace: 'nowrap',
          }}>
            Add to <b style={{ color: '#1B1B19', fontWeight: 600 }}>{activeName}</b>'s circle
          </span>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleDraftKey}
            placeholder="type an item, press Enter…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              background: 'none',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleAddItem}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
              background: '#1B1B19',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Circle Modal */}
      {addOpen && (
        <AddCircleModal
          onClose={() => setAddOpen(false)}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
}
