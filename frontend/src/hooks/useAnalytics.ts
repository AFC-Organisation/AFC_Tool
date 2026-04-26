import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AcademicYear, Event, Registration } from '../types/event';

export type EventTypeFilter = 'event' | 'workshop' | 'project' | 'all';

export interface AnalyticsEvent extends Event {
  registrations: Registration[];
}

export interface YearSummary {
  year: AcademicYear;
  totalRegistrations: number;
  totalEvents: number;
  avgCheckInRate: number;
  totalCheckedIn: number;
}

export function useAnalytics() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventTypeFilter>('all');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [yearSummaries, setYearSummaries] = useState<YearSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load academic years
  useEffect(() => {
    async function loadYears() {
      setYearsLoading(true);
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_datum', { ascending: false });

      if (error) {
        setYearsLoading(false);
        return;
      }

      const yearList = data || [];
      setYears(yearList);

      if (yearList.length > 0) {
        const current = yearList.find((y) => y.is_huidig) ?? yearList[0];
        setSelectedYearId(current.id);
      }

      setYearsLoading(false);
    }

    loadYears();
  }, []);

  // Load events + registrations for selected year
  const loadEventsForYear = useCallback(async (yearId: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('events')
      .select(`*, registrations(*)`)
      .eq('academic_year_id', yearId)
      .eq('status', 'compleet')
      .order('event_datum', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEvents((data as AnalyticsEvent[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      loadEventsForYear(selectedYearId);
    }
  }, [selectedYearId, loadEventsForYear]);

  // Load summaries for all years (year comparison)
  useEffect(() => {
    async function loadAllYearSummaries() {
      if (years.length === 0) return;

      const { data, error } = await supabase
        .from('events')
        .select(`id, academic_year_id, status, registrations(id, checked_in)`)
        .eq('status', 'compleet');

      if (error || !data) return;

      const summaries: YearSummary[] = years.map((year) => {
        const yearEvents = data.filter((e) => e.academic_year_id === year.id);
        const totalRegistrations = yearEvents.reduce(
          (sum, e) => sum + (e.registrations?.length ?? 0),
          0
        );
        const totalCheckedIn = yearEvents.reduce(
          (sum, e) =>
            sum + (e.registrations?.filter((r: { checked_in: boolean }) => r.checked_in).length ?? 0),
          0
        );

        return {
          year,
          totalRegistrations,
          totalEvents: yearEvents.length,
          totalCheckedIn,
          avgCheckInRate:
            totalRegistrations > 0
              ? Math.round((totalCheckedIn / totalRegistrations) * 100)
              : 0,
        };
      });

      setYearSummaries(summaries);
    }

    loadAllYearSummaries();
  }, [years]);

  // Filter events by type
  const filteredEvents =
    selectedEventType === 'all'
      ? events
      : events.filter((e) => e.type === selectedEventType);

  const selectedYear = years.find((y) => y.id === selectedYearId) ?? null;

  return {
    years,
    selectedYear,
    selectedYearId,
    setSelectedYearId,
    selectedEventType,
    setSelectedEventType,
    events: filteredEvents,
    allEvents: events,
    yearSummaries,
    loading,
    yearsLoading,
    error,
    refetch: () => selectedYearId && loadEventsForYear(selectedYearId),
  };
}