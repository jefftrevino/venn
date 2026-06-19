import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function randCode() {
  return Math.random().toString(36).slice(2, 8).toLowerCase();
}

export function useTeam() {
  const [step, setStep] = useState('loading');
  const [notFound, setNotFound] = useState(false);
  const [team, setTeam] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [meId, setMeId] = useState(null);
  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [divergence, setDivergence] = useState(null);

  const channelRef = useRef(null);
  const scheduleRef = useRef(null);
  const seqRef = useRef(0);
  const draggingRef = useRef(new Set());
  // Keep a live ref to team so callbacks don't go stale
  const teamRef = useRef(null);
  useEffect(() => { teamRef.current = team; }, [team]);

  // ─── scheduleSuggestions ─────────────────────────────────────────────────
  const scheduleSuggestions = useCallback((currentParticipants, teamData) => {
    clearTimeout(scheduleRef.current);

    const eligible = currentParticipants.filter(p => p.items.length > 0);
    const tid = (teamData && teamData.id) || (teamRef.current && teamRef.current.id) || null;

    if (eligible.length < 2) {
      if (tid) {
        supabase.from('team_results')
          .upsert({ team_id: tid, suggestions: [], divergence: null, loading: false }, { onConflict: 'team_id' })
          .then(() => {});
      }
      setResult(null);
      setDivergence(null);
      setResultLoading(false);
      return;
    }

    // Signal all clients that recalculation is in progress
    setResultLoading(true);
    if (tid) {
      supabase.from('team_results')
        .upsert({ team_id: tid, loading: true }, { onConflict: 'team_id' })
        .then(() => {});
    }

    scheduleRef.current = setTimeout(async () => {
      const seq = ++seqRef.current;

      try {
        const occasion = (teamData && teamData.occasion) || (teamRef.current && teamRef.current.occasion) || null;
        const { data, error } = await supabase.functions.invoke('suggest', {
          body: {
            participants: eligible.map(p => ({
              name: p.name,
              items: p.items.map(i => i.text),
            })),
            occasion,
          },
        });

        if (seq !== seqRef.current) return;

        if (error) {
          if (tid) {
            supabase.from('team_results')
              .upsert({ team_id: tid, loading: false }, { onConflict: 'team_id' })
              .then(() => {});
          }
          setResultLoading(false);
          return;
        }

        const suggestions = (data && data.suggestions) || [];
        const newDivergence = (data && data.divergence) || null;
        if (tid) {
          await supabase.from('team_results').upsert(
            { team_id: tid, suggestions, divergence: newDivergence, loading: false, updated_at: new Date().toISOString() },
            { onConflict: 'team_id' }
          );
        }
        if (seq !== seqRef.current) return;
        setResult(suggestions.length ? suggestions : null);
        setDivergence(newDivergence);
        setResultLoading(false);
      } catch (err) {
        if (seq !== seqRef.current) return;
        if (tid) {
          supabase.from('team_results')
            .upsert({ team_id: tid, loading: false }, { onConflict: 'team_id' })
            .then(() => {});
        }
        setResultLoading(false);
      }
    }, 1100);
  }, []);

  // ─── Subscribe to realtime ───────────────────────────────────────────────
  const subscribe = useCallback((teamId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('team:' + teamId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'participants',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        const p = payload.new;
        setParticipants(prev => {
          if (prev.some(x => x.id === p.id)) return prev;
          return [...prev, { id: p.id, name: p.name, items: [] }];
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'items',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        const item = payload.new;
        setParticipants(prev => {
          return prev.map(p => {
            if (p.id !== item.participant_id) return p;
            // If already present (optimistic), skip
            if (p.items.some(it => it.id === item.id)) return p;
            // Replace a matching temp item (same text, flagged _temp)
            const tempIdx = p.items.findIndex(it => it._temp && it.text === item.text);
            if (tempIdx !== -1) {
              const newItems = [...p.items];
              newItems[tempIdx] = { id: item.id, text: item.text, rx: item.rx, ry: item.ry };
              return { ...p, items: newItems };
            }
            return {
              ...p,
              items: [...p.items, { id: item.id, text: item.text, rx: item.rx, ry: item.ry }],
            };
          });
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'items',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        const item = payload.new;
        if (draggingRef.current.has(item.id)) return;
        setParticipants(prev => {
          return prev.map(p => {
            if (p.id !== item.participant_id) return p;
            return {
              ...p,
              items: p.items.map(it =>
                it.id === item.id
                  ? { ...it, text: item.text, rx: item.rx, ry: item.ry }
                  : it
              ),
            };
          });
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'items',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        const itemId = payload.old.id;
        setParticipants(prev =>
          prev.map(p => ({ ...p, items: p.items.filter(it => it.id !== itemId) }))
        );
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_results',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setResult(null);
          setResultLoading(false);
          return;
        }
        const suggestions = payload.new.suggestions || [];
        setResult(suggestions.length ? suggestions : null);
        setResultLoading(!!payload.new.loading);
        setDivergence(payload.new.divergence || null);
      })
      .subscribe();

    channelRef.current = channel;
  }, []);

  // ─── Load team from DB ────────────────────────────────────────────────────
  const loadTeam = useCallback(async (code, meParam) => {
    const { data, error } = await supabase
      .from('teams')
      .select('id,code,name,occasion, participants(id,name,created_at, items(id,text,rx,ry,created_at)), team_results(suggestions,loading,divergence)')
      .eq('code', code)
      .single();

    if (error || !data) {
      setNotFound(true);
      setStep('create');
      return;
    }

    const ps = (data.participants || []).map(p => ({
      id: p.id,
      name: p.name,
      items: [...(p.items || [])]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(it => ({ id: it.id, text: it.text, rx: it.rx, ry: it.ry })),
    }));

    const teamData = { id: data.id, code: data.code, name: data.name, occasion: data.occasion || null };
    setTeam(teamData);
    teamRef.current = teamData;
    setParticipants(ps);

    // PostgREST returns team_results as an object (one-to-one via PK FK), not an array
    const resultRow = Array.isArray(data.team_results)
      ? data.team_results[0]
      : data.team_results;
    if (resultRow) {
      const suggestions = resultRow.suggestions || [];
      setResult(suggestions.length ? suggestions : null);
      setResultLoading(!!resultRow.loading);
      setDivergence(resultRow.divergence || null);
    }

    subscribe(data.id);

    if (meParam && ps.some(p => p.id === meParam)) {
      setMeId(meParam);
      setStep('app');
    } else {
      setStep('join');
    }
  }, [subscribe]);

  // ─── Mount: read URL params ───────────────────────────────────────────────
  useEffect(() => {
    let params;
    try { params = new URLSearchParams(location.search || ''); } catch (e) { params = new URLSearchParams(''); }
    const code = params.get('team');
    const me = params.get('me');

    if (code) {
      loadTeam(code, me);
    } else {
      setStep('create');
    }
  }, [loadTeam]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      clearTimeout(scheduleRef.current);
    };
  }, []);

  // ─── createTeam ──────────────────────────────────────────────────────────
  const createTeam = useCallback(async (teamName, yourName, occasion) => {
    const tn = teamName.trim();
    const yn = yourName.trim();
    if (!tn || !yn) return;

    try {
      const code = randCode();
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .insert({ code, name: tn, occasion: occasion ? occasion.trim() || null : null })
        .select()
        .single();

      if (teamErr) throw teamErr;

      const { data: partData, error: partErr } = await supabase
        .from('participants')
        .insert({ team_id: teamData.id, name: yn })
        .select()
        .single();

      if (partErr) throw partErr;

      const newTeam = { id: teamData.id, code: teamData.code, name: teamData.name, occasion: teamData.occasion || null };
      const newPart = { id: partData.id, name: partData.name, items: [] };

      teamRef.current = newTeam;
      setTeam(newTeam);
      setParticipants([newPart]);
      setMeId(partData.id);
      setStep('app');

      subscribe(teamData.id);

      try {
        history.replaceState(null, '', location.pathname + '?team=' + code + '&me=' + partData.id);
      } catch (e) {}
    } catch (err) {
      console.error('createTeam error:', err);
      alert('Failed to create team. Please try again.');
    }
  }, [subscribe]);

  // ─── joinTeam ────────────────────────────────────────────────────────────
  const joinTeam = useCallback(async (name) => {
    const n = name.trim();
    const currentTeam = teamRef.current;
    if (!n || !currentTeam) return;

    try {
      const { data: partData, error } = await supabase
        .from('participants')
        .insert({ team_id: currentTeam.id, name: n })
        .select()
        .single();

      if (error) throw error;

      const newPart = { id: partData.id, name: partData.name, items: [] };
      setParticipants(prev => [...prev, newPart]);
      setMeId(partData.id);
      setStep('app');

      try {
        history.replaceState(null, '', location.pathname + '?team=' + currentTeam.code + '&me=' + partData.id);
      } catch (e) {}
    } catch (err) {
      console.error('joinTeam error:', err);
      alert('Failed to join team. Please try again.');
    }
  }, []);

  // ─── addItem ─────────────────────────────────────────────────────────────
  const addItem = useCallback(async (text) => {
    const currentTeam = teamRef.current;
    if (!text.trim() || !meId || !currentTeam) return;

    const tempId = uid();
    const tempItem = { id: tempId, text: text.trim(), rx: null, ry: null, _temp: true };

    // Compute the updated participants inline to pass to scheduleSuggestions
    let updatedParticipants;
    setParticipants(prev => {
      updatedParticipants = prev.map(p =>
        p.id === meId ? { ...p, items: [...p.items, tempItem] } : p
      );
      return updatedParticipants;
    });

    // We need to schedule after the state is set; use a microtask-safe approach
    // by relying on updatedParticipants captured in the closure above
    // (React batches but the variable is set synchronously before commit)
    Promise.resolve().then(() => {
      if (updatedParticipants) {
        scheduleSuggestions(updatedParticipants, currentTeam);
      }
    });

    try {
      const { data, error } = await supabase
        .from('items')
        .insert({ team_id: currentTeam.id, participant_id: meId, text: text.trim() })
        .select()
        .single();

      if (error) throw error;

      // Replace temp item with real DB item
      setParticipants(prev => prev.map(p => {
        if (p.id !== meId) return p;
        return {
          ...p,
          items: p.items.map(it =>
            it.id === tempId
              ? { id: data.id, text: data.text, rx: data.rx, ry: data.ry }
              : it
          ),
        };
      }));
    } catch (err) {
      console.error('addItem error:', err);
      // Rollback optimistic update
      setParticipants(prev => prev.map(p => {
        if (p.id !== meId) return p;
        return { ...p, items: p.items.filter(it => it.id !== tempId) };
      }));
    }
  }, [meId, scheduleSuggestions]);

  // ─── removeItem ──────────────────────────────────────────────────────────
  const removeItem = useCallback(async (itemId) => {
    const currentTeam = teamRef.current;
    let updatedParticipants;
    setParticipants(prev => {
      updatedParticipants = prev.map(p => ({
        ...p,
        items: p.items.filter(it => it.id !== itemId),
      }));
      return updatedParticipants;
    });

    Promise.resolve().then(() => {
      if (updatedParticipants) {
        scheduleSuggestions(updatedParticipants, currentTeam);
      }
    });

    try {
      await supabase.from('items').delete().eq('id', itemId);
    } catch (err) {
      console.error('removeItem error:', err);
    }
  }, [scheduleSuggestions]);

  // ─── updateItemPosition ──────────────────────────────────────────────────
  const updateItemPosition = useCallback(async (itemId, rx, ry) => {
    draggingRef.current.delete(itemId);
    try {
      await supabase.from('items').update({ rx, ry }).eq('id', itemId);
    } catch (err) {
      console.error('updateItemPosition error:', err);
    }
  }, []);

  // ─── startDrag ───────────────────────────────────────────────────────────
  const startDrag = useCallback((itemId) => {
    draggingRef.current.add(itemId);
  }, []);

  // ─── setActive ───────────────────────────────────────────────────────────
  const setActive = useCallback((participantId) => {
    setMeId(participantId);
    const currentTeam = teamRef.current;
    if (currentTeam) {
      try {
        history.replaceState(null, '', location.pathname + '?team=' + currentTeam.code + '&me=' + participantId);
      } catch (e) {}
    }
  }, []);

  const shareLink = team
    ? (location.origin + location.pathname + '?team=' + team.code)
    : '';

  return {
    step,
    notFound,
    team,
    participants,
    meId,
    result,
    resultLoading,
    divergence,
    createTeam,
    joinTeam,
    addItem,
    removeItem,
    updateItemPosition,
    startDrag,
    setActive,
    shareLink,
    // Exposed for DiagramCanvas drag updates
    setParticipants,
    scheduleSuggestions,
  };
}
