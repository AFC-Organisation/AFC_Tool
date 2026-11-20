import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUserFromAuthHeader } from '../_lib/requireUser';

const TT_BASE = 'https://api.tickettailor.com/v1';

type TicketTailorListResponse = {
  data: unknown[];
  links?: { next?: string | null; previous?: string | null };
};

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

    const next = json.links?.next;
    url = next || null;
  }

  return all;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUserFromAuthHeader(req.headers.authorization);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const apiKey = process.env.TICKET_TAILOR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'TICKET_TAILOR_API_KEY ontbreekt in environment variables.',
    });
  }

  try {
    const events = await fetchAllEvents(apiKey);
    return res.status(200).json({ data: events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Onbekende fout';
    return res.status(502).json({ error: message });
  }
}
