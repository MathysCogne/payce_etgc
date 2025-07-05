import { createClient } from '@supabase/supabase-js'

// This is a server-side-only client. 
// It does not handle user sessions, and should only be used in contexts
// where row-level security is not required, or is handled by other means.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // As this is a server-side client, we disable session persistence
        persistSession: false,
      },
    }
  )
} 