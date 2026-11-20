import { createClient } from '@supabase/supabase-js';

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

function firstHeader(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function requireUserFromAuthHeader(
  authorization: string | string[] | undefined,
  supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
): Promise<AuthResult> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: 500,
      error: 'Supabase environment variables ontbreken op de server.',
    };
  }

  const header = firstHeader(authorization);
  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Niet ingelogd.' };
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false, status: 401, error: 'Niet ingelogd.' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { ok: false, status: 401, error: 'Ongeldige of verlopen sessie.' };
  }

  return { ok: true, userId: user.id };
}
