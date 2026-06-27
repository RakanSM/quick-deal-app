/**
 * @deprecated — Firebase has been replaced with Supabase.
 * This file is a compatibility shim so existing `import ... from '@/firebase'`
 * statements continue to work without changes to every page.
 *
 * All real logic lives in src/supabase.ts.
 */
export {
  SupabaseProvider as FirebaseProvider,
  useSupabase,
  useAuth,
  useFirestore,
  useUser,
  useMemoFirebase,
  useDoc,
  useCollection,
  sbDoc,
  sbCollection,
} from '@/supabase';
