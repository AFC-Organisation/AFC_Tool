const TT_BASE = 'https://api.tickettailor.com/v1';

type TicketTailorListResponse = {
  data: unknown[];
  links?: { next?: string | null; previous?: string | null };
};

type ReqLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ResLike = {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
};

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function requireLoggedInUser(authorization: string | string[] | undefined) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false as const,
      status: 500,
      error: 'Supabase environment variables ontbreken op de server.',
    };
  }

  const header = firstHeader(authorization);
  if (!header?.startsWith('Bearer ')) {
    return { ok: false as const, status: 401, error: 'Niet ingelogd.' };
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false as const, status: 401, error: 'Niet ingelogd.' };
  }

  // Direct Auth REST — geen @supabase/supabase-js bundling in de function
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!userRes.ok) {
    return {
      ok: false as const,
      status: 401,
      error: 'Ongeldige of verlopen sessie.',
    };
  }

  const user = (await userRes.json()) as { id?: string };
  if (!user?.id) {
    return {
      ok: false as const,
      status: 401,
      error: 'Ongeldige of verlopen sessie.',
    };
  }

  return { ok: true as const, userId: user.id };
}

async function fetchAllEvents(apiKey: string) {
  const auth = Buffer.from(`${apiKey}:`).toString('base64');
  const headers = {
    Accept: 'application/json',
    Authorization: `Basic ${auth}`,
  };

  const all: unknown[] = [];
  let url: string | null = `${TT_BASE}/events?limit=100`;

  while (url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`TicketTailor ${res.status}: ${body}`);
    }
    const json = (await res.json()) as TicketTailorListResponse;
    all.push(...(json.data ?? []));
    url = json.links?.next || null;
  }

  return all;
}

export default async function handler(req: ReqLike, res: ResLike) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = await requireLoggedInUser(req.headers.authorization);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const apiKey = process.env.TICKET_TAILOR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'TICKET_TAILOR_API_KEY ontbreekt in environment variables.',
      });
    }

    const events = await fetchAllEvents(apiKey);
    return res.status(200).json({ data: events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Onbekende fout';
    console.error('[tickettailor/events]', message);
    return res.status(500).json({ error: message });
  }
}
