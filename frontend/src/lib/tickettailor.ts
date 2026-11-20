import { supabase } from '@/lib/supabase';
import type { TicketTailorEvent } from '@/types/tickettailor';

export async function fetchTicketTailorEvents(): Promise<TicketTailorEvent[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Niet ingelogd.');
  }

  const res = await fetch('/api/tickettailor/events', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof body.error === 'string'
        ? body.error
        : `TicketTailor request failed (${res.status})`,
    );
  }

  return (body.data ?? []) as TicketTailorEvent[];
}
