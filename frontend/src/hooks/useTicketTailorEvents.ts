import { useCallback, useEffect, useState } from 'react';
import { fetchTicketTailorEvents } from '@/lib/tickettailor';
import type { TicketTailorEvent } from '@/types/tickettailor';

export function useTicketTailorEvents(enabled = true) {
  const [events, setEvents] = useState<TicketTailorEvent[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketTailorEvents();
      // Nieuwste eerst
      const sorted = [...data].sort(
        (a, b) => (b.start?.unix ?? 0) - (a.start?.unix ?? 0),
      );
      setEvents(sorted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refetch();
  }, [enabled, refetch]);

  return { events, loading, error, refetch };
}
