import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Flame, MoreHorizontal, CheckCheck, Search, MapPin, Users, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AcademicYearStatsBar } from './AcademicYearStatsBar';
import type { AcademicYearWithEvents, EventWithRegistrations } from '../types/academiejaar';

interface AcademicYearCardProps {
  year: AcademicYearWithEvents;
  defaultOpen?: boolean;
  onSetCurrent: (yearId: string) => void;
  onViewEvent: (event: EventWithRegistrations) => void;
  onDelete: (yearId: string) => Promise<void> | void;
}

// Academiejaar loopt vast van september (8) t/m mei (4), kalenderjaar-onafhankelijk
const MONTH_ORDER = [8, 9, 10, 11, 0, 1, 2, 3, 4]; // sep, okt, nov, dec, jan, feb, mrt, apr, mei
const MONTH_LABELS = ['Sep', 'Okt', 'Nov', 'Dec', 'Jan', 'Feb', 'Mrt', 'Apr', 'Mei'];

const STATUS_FILTERS = [
  { key: 'all', label: 'Alle' },
  { key: 'upcoming', label: 'Aankomend' },
  { key: 'concept', label: 'Concept' },
  { key: 'gepubliceerd', label: 'Gepubliceerd' },
  { key: 'afgerond', label: 'Afgerond' },
  { key: 'geannuleerd', label: 'Geannuleerd' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['key'];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  concept:      { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
  gepubliceerd: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  afgerond:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  geannuleerd:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
};

const TYPE_STYLES: Record<string, string> = {
  workshop: 'bg-[#ed6425]/10 text-[#ed6425] border-[#ed6425]/20',
  lezing:   'bg-[#041c3a]/8 text-[#041c3a] border-[#041c3a]/12',
  project:  'bg-cyan-50 text-cyan-700 border-cyan-100',
  andere:   'bg-slate-100 text-slate-600 border-slate-200',
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  const e = new Date(end).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}

/** Compacte kaart voor in de maandkolom */
function CompactEventCard({ event, onView }: { event: EventWithRegistrations; onView: (e: EventWithRegistrations) => void }) {
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.concept;
  const typeStyle = TYPE_STYLES[event.type] ?? TYPE_STYLES.andere;

  return (
    <button
      onClick={() => onView(event)}
      className="w-full text-left group flex flex-col gap-1.5 p-2.5 rounded-lg border border-slate-100 bg-white hover:border-[#041c3a]/25 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[11px] font-bold text-[#041c3a] leading-snug line-clamp-2">
          {event.titel}
        </span>
        {event.event_datum && (
          <span className="shrink-0 text-[10px] font-bold text-[#ed6425] bg-[#ed6425]/8 rounded px-1 py-0.5">
            {new Date(event.event_datum).getDate()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${typeStyle}`}>
          {event.type}
        </span>
        <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-semibold ${status.bg} ${status.text}`}>
          <span className={`h-1 w-1 rounded-full ${status.dot}`} />
        </span>
      </div>

      <div className="flex items-center gap-2 text-[9px] text-slate-400 flex-wrap">
        {event.locatie && (
          <span className="flex items-center gap-0.5 truncate max-w-[80px]">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {event.locatie}
          </span>
        )}
        {event.start_tijd && (
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5 shrink-0" />
            {event.start_tijd.slice(0, 5)}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Users className="h-2.5 w-2.5 shrink-0" />
          {event.registrations_count}
        </span>
      </div>
    </button>
  );
}

export function AcademicYearCard({ year, defaultOpen = false, onSetCurrent, onViewEvent, onDelete }: AcademicYearCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Verdeel events over de 9 vaste maandkolommen (sep t/m mei); geen datum → laatste kolom
  const columns = useMemo(() => {
    const buckets: EventWithRegistrations[][] = MONTH_ORDER.map(() => []);
    const noDate: EventWithRegistrations[] = [];

    for (const e of year.events) {
      if (!e.event_datum) {
        noDate.push(e);
        continue;
      }
      const m = new Date(e.event_datum).getMonth();
      const idx = MONTH_ORDER.indexOf(m);
      if (idx === -1) continue;
      buckets[idx].push(e);
    }

    // sorteer elke kolom chronologisch op dag
    buckets.forEach((b) =>
      b.sort((a, c) => new Date(a.event_datum!).getTime() - new Date(c.event_datum!).getTime())
    );

    return { buckets, noDate };
  }, []);

  async function handleDeleteConfirm() {
    setDeleteLoading(true);
    await onDelete(year.id);
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
  }

  return (
    <>
      <div
        className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden
          ${year.is_huidig
            ? 'border-[#ed6425]/40 shadow-[0_0_0_1px_rgba(237,100,37,0.15)]'
            : 'border-slate-200 hover:border-slate-300'
          }`}
      >
        {year.is_huidig && (
          <div className="h-1 w-full bg-gradient-to-r from-[#ed6425] to-[#041c3a]" />
        )}

        {/* Header */}
        <div
          className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-slate-400 shrink-0">
            {open
              ? <ChevronDown className="h-4 w-4 text-[#041c3a]" />
              : <ChevronRight className="h-4 w-4 text-[#041c3a]" />
            }
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-[#041c3a] tracking-tight">{year.naam}</h3>
              {year.is_huidig && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-[#ed6425] text-white px-2.5 py-0.5 rounded-full">
                  <Flame className="h-3 w-3" />
                  Actief
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {formatDateRange(year.start_datum, year.eind_datum)}
            </p>
          </div>

          <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
            <AcademicYearStatsBar year={year} />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-[#041c3a] hover:bg-[#041c3a]/5"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-200">
                {!year.is_huidig && (
                  <DropdownMenuItem
                    onClick={() => onSetCurrent(year.id)}
                    className="text-[#041c3a] focus:bg-[#041c3a]/5 focus:text-[#041c3a]"
                  >
                    <CheckCheck className="h-4 w-4 mr-2 text-[#ed6425]" />
                    Instellen als huidig
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-500 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="md:hidden px-5 pb-3" onClick={() => setOpen((o) => !o)}>
          <AcademicYearStatsBar year={year} />
        </div>

        {open && (
          <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 space-y-4">
            {year.events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-400">Geen evenementen voor dit academiejaar.</p>
              </div>
            ) : (
              <>
                {/* Maandkolommen: sep t/m mei, naast elkaar */}
                <div className="overflow-x-auto -mx-1 pb-1">
                  <div className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] gap-2 min-w-full">
                    {MONTH_LABELS.map((label, i) => {
                      const events = columns.buckets[i];
                      return (
                        <div key={label} className="flex flex-col rounded-xl bg-white border border-slate-100 min-h-[80px]">
                          <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                              {label}
                            </span>
                            {events.length > 0 && (
                              <span className="text-[9px] font-bold text-[#ed6425] bg-[#ed6425]/10 rounded-full px-1.5 py-0.5">
                                {events.length}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 p-1.5 space-y-1.5">
                            {events.length === 0 ? (
                              <div className="h-full flex items-center justify-center py-4">
                                <span className="text-[10px] text-slate-300 italic">—</span>
                              </div>
                            ) : (
                              events.map((event) => (
                                <CompactEventCard key={event.id} event={event} onView={onViewEvent} />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Events zonder datum */}
                {columns.noDate.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Zonder datum ({columns.noDate.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                      {columns.noDate.map((event) => (
                        <CompactEventCard key={event.id} event={event} onView={onViewEvent} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(v) => !v && setDeleteDialogOpen(false)}>
        <AlertDialogContent className="border-slate-200 shadow-2xl max-w-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-lg" />
          <AlertDialogHeader className="pt-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <AlertDialogTitle className="text-[#041c3a] font-black text-lg leading-tight">
                Academiejaar naar prullenbak?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed pl-12">
              <span className="font-semibold text-slate-700">"{year.naam}"</span> wordt
              verplaatst naar de prullenbak. De gekoppelde evenementen blijven
              behouden en zijn terug te vinden zodra je het jaar herstelt.
              {year.is_huidig && (
                <span className="block mt-2 text-amber-600 font-semibold">
                  Let op: dit is het huidige actieve academiejaar.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold gap-2 border-0"
            >
              <Trash2 className="w-4 h-4" />
              {deleteLoading ? 'Verplaatsen...' : 'Naar prullenbak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}