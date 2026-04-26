import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EventWithRegistrations } from '../types/academiejaar';

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  concept:     { pill: 'bg-slate-100 text-slate-500 border-slate-200',          dot: 'bg-slate-400' },
  gepubliceerd:{ pill: 'bg-blue-50 text-blue-700 border-blue-100',               dot: 'bg-blue-500' },
  afgerond:    { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100',      dot: 'bg-emerald-500' },
  geannuleerd: { pill: 'bg-red-50 text-red-600 border-red-100',                  dot: 'bg-red-400' },
};

const TYPE_STYLES: Record<string, string> = {
  workshop: 'bg-[#ed6425]/10 text-[#ed6425] border-[#ed6425]/20',
  lezing:   'bg-[#041c3a]/8 text-[#041c3a] border-[#041c3a]/12',
  project:  'bg-cyan-50 text-cyan-700 border-cyan-100',
  andere:   'bg-slate-100 text-slate-600 border-slate-200',
};

const TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  lezing:   'Lezing',
  project:  'Project',
  andere:   'Andere',
};

const STATUS_LABELS: Record<string, string> = {
  concept:      'Concept',
  gepubliceerd: 'Gepubliceerd',
  afgerond:     'Afgerond',
  geannuleerd:  'Geannuleerd',
};

interface EventCardProps {
  event: EventWithRegistrations;
  onView: (event: EventWithRegistrations) => void;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export function EventCard({ event, onView }: EventCardProps) {
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.concept;
  const typeStyle = TYPE_STYLES[event.type] ?? TYPE_STYLES.andere;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-[#041c3a]/20 hover:shadow-sm transition-all duration-150">

      {/* Date block */}
      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#041c3a] text-white text-center">
        {event.event_datum ? (
          <>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#ed6425] leading-none">
              {new Date(event.event_datum).toLocaleDateString('nl-BE', { month: 'short' })}
            </span>
            <span className="text-lg font-black leading-tight">
              {new Date(event.event_datum).getDate()}
            </span>
          </>
        ) : (
          <span className="text-xs text-white/40">—</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5 flex-wrap">
          <h4 className="text-sm font-bold text-[#041c3a] truncate flex-1">{event.titel}</h4>
          <div className="flex gap-1 shrink-0">
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${typeStyle}`}>
              {TYPE_LABELS[event.type] ?? event.type}
            </span>
            <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold border ${status.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {STATUS_LABELS[event.status] ?? event.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {event.locatie && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.locatie}
            </span>
          )}
          {event.start_tijd && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(event.start_tijd)}
              {event.einde_tijd ? ` – ${formatTime(event.einde_tijd)}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event.registrations_count}
            {event.max_deelnemers ? ` / ${event.max_deelnemers}` : ''} inschrijvingen
          </span>
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 text-[#ed6425] hover:text-[#ed6425] hover:bg-[#ed6425]/8 gap-1 font-semibold text-xs"
        onClick={() => onView(event)}
      >
        Bekijken
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}