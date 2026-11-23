import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, remoteEnabled } from '../lib/supabase';
import * as remote from '../lib/remote';

const SyncContext = createContext(null);
export const useSync = () => useContext(SyncContext);

// status: 'local' (sem Supabase) | 'signed-out' | 'loading' | 'synced' | 'saving' | 'error'
export function SyncProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!remoteEnabled);
  const [remoteData, setRemoteData] = useState({});
  const [remoteReady, setRemoteReady] = useState(false);
  const [status, setStatus] = useState(remoteEnabled ? 'signed-out' : 'local');
  const [errorMsg, setErrorMsg] = useState('');
  const pending = useRef(0);

  // Sessão
  useEffect(() => {
    if (!remoteEnabled) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Carga inicial + tempo real
  useEffect(() => {
    if (!remoteEnabled) return;
    if (!user) {
      setRemoteData({});
      setRemoteReady(false);
      setStatus('signed-out');
      return;
    }
    let off = () => {};
    let cancelled = false;
    setStatus('loading');
    remote
      .fetchAll(user.id)
      .then((map) => {
        if (cancelled) return;
        setRemoteData(map);
        setRemoteReady(true);
        setStatus('synced');
        off = remote.subscribe(user.id, (key, row) =>
          setRemoteData((prev) => (prev[key]?.t >= row.t ? prev : { ...prev, [key]: row }))
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(e.message || 'Falha ao carregar dados da nuvem.');
      });
    return () => {
      cancelled = true;
      off();
    };
  }, [user?.id]);

  const push = useCallback(
    async (key, value, t) => {
      if (!remoteEnabled || !user) return;
      pending.current += 1;
      setStatus('saving');
      try {
        await remote.upsert(user.id, key, value, t);
        pending.current -= 1;
        if (pending.current === 0) setStatus('synced');
      } catch (e) {
        pending.current = Math.max(0, pending.current - 1);
        setStatus('error');
        setErrorMsg(e.message || 'Falha ao salvar na nuvem.');
      }
    },
    [user]
  );

  const signIn = useCallback(async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ enabled: remoteEnabled, authReady, user, status, errorMsg, remoteData, remoteReady, push, signIn, signOut }),
    [authReady, user, status, errorMsg, remoteData, remoteReady, push, signIn, signOut]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
