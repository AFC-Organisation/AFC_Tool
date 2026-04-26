import { useState } from 'react';
import { GraduationCap, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcademicYears, useCreateAcademicYear, useSetCurrentYear,useEventDetail } from '../hooks/useAcademicYears';
import { AcademicYearCard } from '../components/academicYear/AcademicYearCard';
import { CreateAcademicYearDialog } from '../components/academicYear/CreateAcademicYearDialog';
import { EventDetailSheet } from '../components/academicYear/EventDetailSheet';
import { SetCurrentYearDialog } from '../components/academicYear/SetCurrentYearDialog';
import type { AcademicYearWithEvents, CreateAcademicYearInput, EventWithRegistrations } from '../types/academiejaar';
import { AppLayout } from '../components/layout/AppLayout';

export default function AcademiejarenPage() {
  const { years, loading, error, refetch } = useAcademicYears();
  const { create, loading: createLoading } = useCreateAcademicYear();
  const { setCurrent, loading: setCurrentLoading } = useSetCurrentYear();

  const { event: selectedEvent, loading: eventLoading, load: loadEvent, clear: clearEvent } = useEventDetail();
  const [pendingSetCurrentYear, setPendingSetCurrentYear] = useState<AcademicYearWithEvents | null>(null);

  const currentYear = years.find((y) => y.is_huidig);

  async function handleCreate(input: CreateAcademicYearInput) {
    await create(input);
    refetch();
  }

  async function handleSetCurrent() {
    if (!pendingSetCurrentYear) return;
    const ok = await setCurrent(pendingSetCurrentYear.id);
    if (ok) {
      setPendingSetCurrentYear(null);
      refetch();
    }
  }

  return (
    <AppLayout
      title="Academiejaren Historiek"
      subtitle="Overzicht van alle jaren"
    >
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#041c3a]">
                <GraduationCap className="h-5 w-5 text-[#ed6425]" />
              </div>
              <h1 className="text-2xl font-bold text-[#041c3a] tracking-tight">
                Academiejaren
              </h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              Overzicht van alle academiejaren en hun evenementen.
            </p>
          </div>
          <CreateAcademicYearDialog onConfirm={handleCreate} loading={createLoading} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#ed6425]/30 via-[#041c3a]/10 to-transparent" />

        {/* Current year highlight */}
        {currentYear && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#041c3a] border border-[#041c3a]">
            <span className="h-2 w-2 rounded-full bg-[#ed6425] animate-pulse shrink-0" />
            <p className="text-sm text-white">
              Huidig actief academiejaar:{' '}
              <strong className="font-semibold text-[#ed6425]">{currentYear.naam}</strong>
              <span className="text-slate-300 ml-2">
                ({currentYear.total_events} evenementen · {currentYear.total_registrations} inschrijvingen)
              </span>
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-3 text-[#ed6425]" />
            <span className="text-sm">Academiejaren laden...</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Fout bij laden</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={refetch} className="text-red-600 hover:text-red-700">
              <RefreshCw className="h-4 w-4 mr-1" /> Opnieuw
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && years.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#041c3a]/5 border border-[#041c3a]/10 flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-[#041c3a]/30" />
            </div>
            <h3 className="text-base font-semibold text-[#041c3a] mb-1">Nog geen academiejaren</h3>
            <p className="text-sm text-slate-400 mb-6">
              Maak je eerste academiejaar aan via de knop hierboven.
            </p>
          </div>
        )}

        {/* Year cards */}
        {!loading && !error && years.length > 0 && (
          <div className="space-y-3">
            {years.map((year, i) => (
              <AcademicYearCard
                key={year.id}
                year={year}
                defaultOpen={i === 0}
                onSetCurrent={(id) => {
                  const y = years.find((yr) => yr.id === id);
                  if (y) setPendingSetCurrentYear(y);
                }}
                onViewEvent={(e) => loadEvent(e.id)}
              />
            ))}
          </div>
        )}

        {/* Event detail sheet */}
        <EventDetailSheet event={selectedEvent} onClose={clearEvent} />

        {/* Set current year confirmation */}
        <SetCurrentYearDialog
          year={pendingSetCurrentYear}
          currentYear={currentYear}
          onConfirm={handleSetCurrent}
          onCancel={() => setPendingSetCurrentYear(null)}
          loading={setCurrentLoading}
        />
      </div>
    </AppLayout>
  );
}