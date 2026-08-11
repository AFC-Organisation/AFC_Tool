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
    .is('deleted_at', null)
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
          .is('deleted_at', null)
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
        feedback(*),
        event_rollen(*, event_rol_users(*))
      `)
      .eq('id', eventId)
      .single();

    if (data) {
      data.registrations_count = data.registrations?.length ?? 0;
    }
     
    const allUserIds = [
     ...new Set(
       (data.event_rollen ?? []).flatMap((r: any) =>
         (r.event_rol_users ?? []).map((t: any) => t.user_id)
        )
      ),
    ];

    let userMap = new Map<string, any>();
    if (allUserIds.length) {
      const { data: usersInfo } = await supabase.rpc('get_users_info', { user_ids: allUserIds });
      userMap = new Map((usersInfo ?? []).map((u: any) => [u.id, u]));
    }

    data.event_rollen = (data.event_rollen ?? []).map((r: any) => ({
      ...r,
      toegewezen: (r.event_rol_users ?? []).map((t: any) => {
        const u = userMap.get(t.user_id);
        return {
          ...t,
          user_email: u?.email ?? t.user_id,
          user_naam: u?.full_name ?? null,
        };
      }),
    }));
    setEvent(data);
    setLoading(false);
  }, []);

  const clear = useCallback(() => setEvent(null), []);

  return { event, loading, load, clear };

  
}

// ── Soft delete / restore an academic year ────────────────────────────────
export function useDeleteAcademicYear() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const softDelete = async (yearId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase
      .from('academic_years')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', yearId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  };

  const restore = async (yearId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase
      .from('academic_years')
      .update({ deleted_at: null })
      .eq('id', yearId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  };

  const permanentlyDelete = async (yearId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', yearId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  };

  return { softDelete, restore, permanentlyDelete, loading, error };
}

// ── Export unique registration emails for an academic year ───────────────────
export function useExportEmails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportEmails = async (eventIds: string[]): Promise<string[]> => {
    setLoading(true);
    setError(null);

    if (eventIds.length === 0) {
      setLoading(false);
      return [];
    }

    const { data, error: err } = await supabase
      .from('registrations')
      .select('email')
      .in('event_id', eventIds);

    setLoading(false);

    if (err) {
      setError(err.message);
      return [];
    }

    const seen = new Map<string, string>();
    for (const row of data ?? []) {
      const raw = (row.email as string | null)?.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!seen.has(key)) seen.set(key, raw);
    }

    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  };

  return { exportEmails, loading, error };
}