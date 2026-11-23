import { useCallback, useEffect, useRef, useState } from 'react';
import { local } from '../lib/storage';
import { useSync } from '../context/SyncContext';

const DEBOUNCE_MS = 800;

/**
 * Estado que persiste em localStorage e, quando há login no Supabase,
 * sincroniza com a nuvem (última edição vence) e recebe mudanças em tempo real.
 */
export function usePersistentState(key, initial) {
  const { user, remoteReady, remoteData, push } = useSync();

  const meta = useRef({ t: 0 });
  const dirty = useRef(false);
  const [value, setValue] = useState(() => {
    const stored = local.get(key);
    if (stored) {
      meta.current.t = stored.t || 0;
      return stored.v;
    }
    const legacy = local.legacy(key);
    if (legacy != null) {
      meta.current.t = 1; // migrado: mais antigo que qualquer edição real
      return legacy;
    }
    return typeof initial === 'function' ? initial() : initial;
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  // Edição local → grava localmente e agenda envio para a nuvem
  const timer = useRef(null);
  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    const t = Date.now();
    meta.current.t = t;
    local.set(key, value, t);
    if (!user) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push(key, value, t), DEBOUNCE_MS);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timer.current), []);

  // Reconciliação com a nuvem (login, carga inicial, tempo real)
  const remoteRow = remoteData[key];
  useEffect(() => {
    if (!user || !remoteReady) return;
    if (remoteRow && remoteRow.t > meta.current.t) {
      meta.current.t = remoteRow.t;
      local.set(key, remoteRow.v, remoteRow.t);
      dirty.current = false;
      setValue(remoteRow.v);
    } else if (meta.current.t > (remoteRow?.t || 0)) {
      push(key, valueRef.current, meta.current.t);
    }
  }, [user?.id, remoteReady, remoteRow?.t]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((updater) => {
    dirty.current = true;
    setValue((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  return [value, set];
}
