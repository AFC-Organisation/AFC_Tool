import type { TicketTailorEvent } from '@/types/tickettailor';

export async function fetchTicketTailorEvents(): Promise<TicketTailorEvent[]> {
  const res = await fetch('/api/tickettailor/events');

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
