import { useState } from 'react';
import { ChevronDown, ChevronRight, Flame, MoreHorizontal, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AcademicYearStatsBar } from './AcademicYearStatsBar';
import { EventCard } from './EventCard';
import type { AcademicYearWithEvents, EventWithRegistrations } from '../types/academiejaar';

interface AcademicYearCardProps {
  year: AcademicYearWithEvents;
  defaultOpen?: boolean;
  onSetCurrent: (yearId: string) => void;
  onViewEvent: (event: EventWithRegistrations) => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  const e = new Date(end).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}

export function AcademicYearCard({ year, defaultOpen = false, onSetCurrent, onViewEvent }: AcademicYearCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden
        ${year.is_huidig
          ? 'border-[#ed6425]/40 shadow-[0_0_0_1px_rgba(237,100,37,0.15)]'
          : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      {/* Active year accent stripe */}
      {year.is_huidig && (
        <div className="h-1 w-full bg-gradient-to-r from-[#ed6425] to-[#041c3a]" />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Toggle icon */}
        <span className="text-slate-400 shrink-0">
          {open
            ? <ChevronDown className="h-4 w-4 text-[#041c3a]" />
            : <ChevronRight className="h-4 w-4 text-[#041c3a]" />
          }
        </span>

        {/* Year info */}
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

        {/* Stats (desktop) */}
        <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
          <AcademicYearStatsBar year={year} />
        </div>

        {/* Actions */}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="md:hidden px-5 pb-3" onClick={() => setOpen((o) => !o)}>
        <AcademicYearStatsBar year={year} />
      </div>

      {/* Events list */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 space-y-2">
          {year.events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-slate-400">Geen evenementen voor dit academiejaar.</p>
            </div>
          ) : (
            year.events.map((event) => (
              <EventCard key={event.id} event={event} onView={onViewEvent} />
            ))
          )}
        </div>
      )}
    </div>
  );
}