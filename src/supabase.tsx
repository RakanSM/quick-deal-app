"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { createClient, SupabaseClient, User, RealtimeChannel } from '@supabase/supabase-js';

// ─── Singleton client ──────────────────────────────────────────────────────────
let _client: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

// ─── Contexts ─────────────────────────────────────────────────────────────────
const SupabaseContext = createContext<SupabaseClient | null>(null);
const UserContext = createContext<{ user: User | null; isUserLoading: boolean }>({
  user: null, isUserLoading: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => getSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  return (
    <SupabaseContext.Provider value={client}>
      <UserContext.Provider value={{ user, isUserLoading }}>
        {children}
      </UserContext.Provider>
    </SupabaseContext.Provider>
  );
}

// ─── Base hook ────────────────────────────────────────────────────────────────
export function useSupabase(): SupabaseClient {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside <SupabaseProvider>');
  return ctx;
}

/** Drop-in replacement for useAuth() — returns Supabase client (has .auth property) */
export const useAuth = useSupabase;

/** Drop-in replacement for useFirestore() — returns Supabase client (.from() for queries) */
export const useFirestore = useSupabase;

/** Returns the current user + loading flag */
export function useUser() {
  return useContext(UserContext);
}

/**
 * Memoises a ref value. Drop-in for useMemoFirebase — just a useMemo wrapper.
 */
export function useMemoFirebase<T>(factory: () => T | null, deps: unknown[]): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

// ─── Ref helpers (replace Firestore doc() / collection()) ─────────────────────
export type SbDocRef  = { _type: 'doc';  table: string; id: string } | null;
export type SbColRef  = { _type: 'col';  table: string; filters?: Record<string, any> } | null;

/**
 * Creates a document ref (drop-in for Firestore doc()).
 * Usage: sbDoc('applications', id)
 */
export function sbDoc(table: string, id: string | undefined | null): SbDocRef {
  if (!id) return null;
  return { _type: 'doc', table, id };
}

/**
 * Creates a collection ref (drop-in for Firestore collection() / query()).
 * Usage: sbCollection('applications', { applicantUid: user.id })
 */
export function sbCollection(table: string, filters?: Record<string, any>): SbColRef {
  return { _type: 'col', table, filters };
}

// ─── useDoc ───────────────────────────────────────────────────────────────────
interface DocState<T> { data: T | null; isLoading: boolean; error: Error | null }

export function useDoc<T = Record<string, any>>(
  ref: SbDocRef,
): DocState<T & { id: string }> {
  const supabase = useSupabase();
  const [state, setState] = useState<DocState<T & { id: string }>>({
    data: null, isLoading: !!ref, error: null,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const key = ref ? `${ref.table}::${ref.id}` : null;

  useEffect(() => {
    if (!ref) { setState({ data: null, isLoading: false, error: null }); return; }
    setState(s => ({ ...s, isLoading: true }));

    supabase.from(ref.table).select('*').eq('id', ref.id).single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          setState({ data: null, isLoading: false, error: new Error(error.message) });
        } else {
          setState({ data: data as any, isLoading: false, error: null });
        }
      });

    // Real-time
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`doc:${ref.table}:${ref.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: ref.table, filter: `id=eq.${ref.id}` },
        payload => {
          if (payload.eventType === 'DELETE') setState({ data: null, isLoading: false, error: null });
          else setState({ data: payload.new as any, isLoading: false, error: null });
        })
      .subscribe();
    channelRef.current = ch;

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current!); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

// ─── useCollection ────────────────────────────────────────────────────────────
interface ColState<T> { data: (T & { id: string })[] | null; isLoading: boolean; error: Error | null }

export function useCollection<T = Record<string, any>>(
  ref: SbColRef,
): ColState<T> {
  const supabase = useSupabase();
  const [state, setState] = useState<ColState<T>>({
    data: null, isLoading: !!ref, error: null,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const key = ref ? `${ref.table}::${JSON.stringify(ref.filters || {})}` : null;

  useEffect(() => {
    if (!ref) { setState({ data: null, isLoading: false, error: null }); return; }
    setState(s => ({ ...s, isLoading: true }));

    const fetchAll = async () => {
      let q = supabase.from(ref.table).select('*');
      if (ref.filters) {
        for (const [col, val] of Object.entries(ref.filters)) q = q.eq(col, val);
      }
      const { data, error } = await q;
      if (error) setState({ data: null, isLoading: false, error: new Error(error.message) });
      else setState({ data: data as any ?? [], isLoading: false, error: null });
    };

    fetchAll();

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`col:${ref.table}:${JSON.stringify(ref.filters || {})}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: ref.table }, () => fetchAll())
      .subscribe();
    channelRef.current = ch;

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current!); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
