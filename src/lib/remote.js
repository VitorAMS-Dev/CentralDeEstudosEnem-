import { supabase } from './supabase';

export async function fetchAll(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('key,value,updated_at')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  for (const row of data || []) map[row.key] = { v: row.value, t: new Date(row.updated_at).getTime() };
  return map;
}

export async function upsert(userId, key, value, t) {
  const { error } = await supabase.from('user_data').upsert(
    { user_id: userId, key, value, updated_at: new Date(t).toISOString() },
    { onConflict: 'user_id,key' }
  );
  if (error) throw error;
}

export function subscribe(userId, onRow) {
  const channel = supabase
    .channel(`user_data:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new;
        if (row && row.key) onRow(row.key, { v: row.value, t: new Date(row.updated_at).getTime() });
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
