import { useMemo } from 'react';
import { BarChart2, Loader2, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AppLayout } from '../components/layout/AppLayout';
import { useAnalytics } from '../hooks/useAnalytics';

import { AnalyticsKPICards } from '../components/analytics/AnalyticsKPICards';
import { EventTypeFilterTabs } from '../components/analytics/EventTypeFilterTabs';
import { FacultyChart } from '../components/analytics/FacultyChart';
import { HowFoundChart } from '../components/analytics/HowFoundChart';
import { StudyYearChart } from '../components/analytics/StudyYearChart';
import { CheckInRateChart } from '../components/analytics/CheckInRateChart';
import { RegistrationSourceChart } from '../components/analytics/RegistrationSourceChart';
import { YearComparisonChart } from '../components/analytics/YearComparisonChart';
import { StrategicInsights } from '../components/analytics/StrategicInsights';
import { ChartCard } from '../components/analytics/ChartCard';

import {
  computeKPIs,
  computeFacultyDistribution,
  computeHowFoundDistribution,
  computeStudyYearDistribution,
  computeSourceDistribution,
  computeEventCheckInRates,
  generateInsights,
} from '../lib/analyticsUtils';

export default function DataAnalysePage() {
  const {
    years,
    selectedYear,
    selectedYearId,
    setSelectedYearId,
    selectedEventType,
    setSelectedEventType,
    events,
    allEvents,
    yearSummaries,
    loading,
    yearsLoading,
    error,
    refetch,
  } = useAnalytics();

  // All analytics are computed from filtered events
  const kpis = useMemo(() => computeKPIs(events), [events]);
  const facultyData = useMemo(() => computeFacultyDistribution(events, 10), [events]);
  const howFoundData = useMemo(() => computeHowFoundDistribution(events), [events]);
  const studyYearData = useMemo(() => computeStudyYearDistribution(events), [events]);
  const sourceData = useMemo(() => computeSourceDistribution(events), [events]);
  const checkInData = useMemo(() => computeEventCheckInRates(events), [events]);
  const insights = useMemo(() => generateInsights(events, kpis), [events, kpis]);

  const hasData = !loading && events.length > 0;
  const hasNoEvents = !loading && !error && allEvents.length === 0;
  const hasNoFilteredEvents = !loading && !error && allEvents.length > 0 && events.length === 0;

  return (
    <AppLayout title="Data Analyse" subtitle="Strategisch inzicht per academiejaar">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#041c3a]">
                <BarChart2 className="h-5 w-5 text-[#ed6425]" />
              </div>
              <h1 className="text-2xl font-bold text-[#041c3a] tracking-tight">
                Data Analyse
              </h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              Analyse op afgeronde evenementen — strategische inzichten per academiejaar.
            </p>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-[#ed6425]/30 via-[#041c3a]/10 to-transparent" />

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Academiejaar</span>
            {yearsLoading ? (
              <div className="w-40 h-9 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <Select
                value={selectedYearId ?? ''}
                onValueChange={(v) => setSelectedYearId(v)}
                disabled={years.length === 0}
              >
                <SelectTrigger className="w-44 h-9 text-sm border-slate-200 focus:ring-[#ed6425]">
                  <SelectValue placeholder="Kies jaar…" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.naam}
                      {y.is_huidig && (
                        <span className="ml-1.5 text-[#ed6425] text-[10px] font-bold">●</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200" />

          {/* Event type tabs */}
          <EventTypeFilterTabs
            selected={selectedEventType}
            onChange={setSelectedEventType}
            allEvents={allEvents}
          />
        </div>

        {/* ── Active year banner ───────────────────────────────────────── */}
        {selectedYear && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#041c3a]">
            <TrendingUp className="h-4 w-4 text-[#ed6425] shrink-0" />
            <p className="text-sm text-white">
              Analyse voor{' '}
              <strong className="font-semibold text-[#ed6425]">{selectedYear.naam}</strong>
              <span className="text-slate-300 ml-2">
                · {allEvents.length} afgeronde evenementen
                {selectedEventType !== 'all' && ` · filter: ${selectedEventType}`}
              </span>
            </p>
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-3 text-[#ed6425]" />
            <span className="text-sm">Data laden…</span>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Fout bij laden</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch?.()}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Opnieuw
            </Button>
          </div>
        )}

        {/* ── Empty state — no completed events ───────────────────────── */}
        {hasNoEvents && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#041c3a]/5 border border-[#041c3a]/10 flex items-center justify-center mb-4">
              <BarChart2 className="h-8 w-8 text-[#041c3a]/30" />
            </div>
            <h3 className="text-base font-semibold text-[#041c3a] mb-1">
              Geen afgeronde evenementen
            </h3>
            <p className="text-sm text-slate-400">
              Analyse is enkel beschikbaar voor evenementen met status{' '}
              <strong>compleet</strong>.
            </p>
          </div>
        )}

        {/* ── No events for filter ─────────────────────────────────────── */}
        {hasNoFilteredEvents && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-400">
              Geen afgeronde{' '}
              <strong>{selectedEventType}</strong>-evenementen in dit academiejaar.
            </p>
          </div>
        )}

        {/* ── Main analytics content ───────────────────────────────────── */}
        {hasData && (
          <div className="space-y-6">

            {/* KPI Cards */}
            <AnalyticsKPICards kpis={kpis} />

            {/* Strategic Insights */}
            <div>
              <h2 className="text-sm font-semibold text-[#041c3a] mb-3 flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-[#ed6425] inline-block" />
                Strategische inzichten
              </h2>
              <StrategicInsights insights={insights} />
            </div>

            {/* Check-in rates per event */}
            <ChartCard
              title="Check-in rate per evenement"
              subtitle="Percentage ingeschreven deelnemers dat effectief aanwezig was"
              badge={`${events.length} events`}
            >
              <CheckInRateChart data={checkInData} />
            </ChartCard>

            {/* 2-col row: Faculty + How Found */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard
                title="Faculteitsverdeling"
                subtitle="Top 10 faculteiten op basis van inschrijvingen"
                badge={`${kpis.uniqueFaculties} faculteiten`}
              >
                <FacultyChart data={facultyData} />
              </ChartCard>

              <ChartCard
                title="Hoe gevonden?"
                subtitle="Via welk kanaal deelnemers de evenementen ontdekten"
              >
                <HowFoundChart data={howFoundData} />
              </ChartCard>
            </div>

            {/* 2-col row: Study year + Source */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard
                title="Studiejaar verdeling"
                subtitle="Welke studiejaren participeren het meest"
              >
                <StudyYearChart data={studyYearData} />
              </ChartCard>

              <ChartCard
                title="Registratiebron"
                subtitle="Via welk platform werden inschrijvingen ingediend"
              >
                <RegistrationSourceChart data={sourceData} />
              </ChartCard>
            </div>

            {/* Year comparison — always shows all years */}
            <ChartCard
              title="Vergelijking over academiejaren"
              subtitle="Inschrijvingen en aanwezigheid per academiejaar (alle afgeronde evenementen)"
              badge={`${yearSummaries.length} jaren`}
            >
              <YearComparisonChart
                summaries={yearSummaries}
                selectedYearId={selectedYearId}
              />
            </ChartCard>

          </div>
        )}
      </div>
    </AppLayout>
  );
}