export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

function firstHeader(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Valideert een Supabase access token via Auth REST (geen supabase-js nodig).
 * Alleen voor lokale Vite-middleware — niet importeren vanuit api/.
 */
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

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!userRes.ok) {
    return { ok: false, status: 401, error: 'Ongeldige of verlopen sessie.' };
  }

  const user = (await userRes.json()) as { id?: string };
  if (!user?.id) {
    return { ok: false, status: 401, error: 'Ongeldige of verlopen sessie.' };
  }

  return { ok: true, userId: user.id };
}
