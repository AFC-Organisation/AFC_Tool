import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  AcademicYear,
  AcademicYearWithEvents,
  CreateAcademicYearInput,
  EventWithRegistrations,
} from '../types/academiejaar';

// ── Fetch all academic years with event/registration counts ──────────────────
export function useAcademicYears() {
  const [years, setYears] = useState<AcademicYearWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: yearsData, error: yearsErr } = await supabase
      .from('academic_years')
      .select('*')
      .order('start_datum', { ascending: false });

    if (yearsErr) {
      setError(yearsErr.message);
      setLoading(false);
      return;
    }

    // For each year, get events + registration counts
    const enriched = await Promise.all(
      (yearsData ?? []).map(async (year) => {
        const { data: events } = await supabase
          .from('events')
          .select('*, registrations(count)')
          .eq('academic_year_id', year.id)
          .order('event_datum', { ascending: true });

        const eventsWithCount: EventWithRegistrations[] = (events ?? []).map((e) => ({
          ...e,
          registrations_count: e.registrations?.[0]?.count ?? 0,
        }));

        return {
          ...year,
          events: eventsWithCount,
          total_events: eventsWithCount.length,
          total_registrations: eventsWithCount.reduce(
            (sum, e) => sum + e.registrations_count,
            0
          ),
        } as AcademicYearWithEvents;
      })
    );

    setYears(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { years, loading, error, refetch: fetch };
}

// ── Create a new academic year ───────────────────────────────────────────────
export function useCreateAcademicYear() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (input: CreateAcademicYearInput): Promise<AcademicYear | null> => {
    setLoading(true);
    setError(null);

    // If this year is set as current, first unset all others
    if (input.is_huidig) {
      await supabase
        .from('academic_years')
        .update({ is_huidig: false })
        .eq('is_huidig', true);
    }

    const { data, error: err } = await supabase
      .from('academic_years')
      .insert(input)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return data;
  };

  return { create, loading, error };
}

// ── Set an academic year as the current one ──────────────────────────────────
export function useSetCurrentYear() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrent = async (yearId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Unset all
    const { error: resetErr } = await supabase
      .from('academic_years')
      .update({ is_huidig: false })
      .eq('is_huidig', true);

    if (resetErr) {
      setError(resetErr.message);
      setLoading(false);
      return false;
    }

    // Set new current
    const { error: setErr } = await supabase
      .from('academic_years')
      .update({ is_huidig: true })
      .eq('id', yearId);

    if (setErr) {
      setError(setErr.message);
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  return { setCurrent, loading, error };
}

export function useEventDetail() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (eventId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        academic_year:academic_years(*),
        domains:event_domains(*, domain:domains(*)),
        event_sprekers(*),
        registrations(*),
        feedback(*)
      `)
      .eq('id', eventId)
      .single();

    if (data) {
      data.registrations_count = data.registrations?.length ?? 0;
    }

    setEvent(data);
    setLoading(false);
  }, []);

  const clear = useCallback(() => setEvent(null), []);

  return { event, loading, load, clear };
}