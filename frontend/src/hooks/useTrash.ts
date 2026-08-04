import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '../types/event';
import type { AcademicYear } from '../types/academiejaar';

export function useTrash() {
  const [trashedEvents, setTrashedEvents] = useState<Event[]>([]);
  const [trashedYears, setTrashedYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: events, error: eventsErr }, { data: years, error: yearsErr }] =
        await Promise.all([
          supabase
            .from('events')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
          supabase
            .from('academic_years')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
        ]);

      if (eventsErr) throw eventsErr;
      if (yearsErr) throw yearsErr;

      setTrashedEvents(events ?? []);
      setTrashedYears(years ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  return { trashedEvents, trashedYears, loading, error, refetch: fetchTrash };
}