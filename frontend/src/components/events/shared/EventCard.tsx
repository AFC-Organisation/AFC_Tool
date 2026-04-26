import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ChevronRight, ArrowRight } from 'lucide-react';
import { EventStatusBadge } from './EventStatusBadge';
import { EventTypeBadge } from './EventTypeBadge';
import type { Event, EventStatus } from '../../../types/event';
import { getNextStatus, EVENT_STATUS_LABELS, isEditable } from '../../../types/event';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onOpen: (event: Event) => void;
  onAdvanceStatus: (event: Event, newStatus: EventStatus) => void;
}

export function EventCard({ event, onOpen, onAdvanceStatus }: EventCardProps) {
  const nextStatus = getNextStatus(event.status);
  const regCount = event.registraties?.length ?? 0;
  const editable = isEditable(event.status);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white flex flex-col overflow-hidden hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425]" />

      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <EventTypeBadge type={event.type} showIcon />
            <EventStatusBadge status={event.status} size="sm" />
          </div>
        </div>

        <h3 className="font-bold text-[#041c3a] mb-3 line-clamp-2 leading-snug text-sm">
          {event.titel}
        </h3>

        <div className="space-y-1.5">
          {event.event_datum && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#ed6425]" />
              <span className="font-medium">
                {format(new Date(event.event_datum), 'd MMM yyyy', { locale: nl })}
              </span>
            </div>
          )}
          {event.locatie && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#ed6425]" />
              <span className="line-clamp-1">{event.locatie}</span>
            </div>
          )}
          {regCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#ed6425]" />
              <span>{regCount} inschrijvingen</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-slate-200 text-[#041c3a] hover:bg-[#041c3a] hover:text-white transition-colors"
          onClick={() => onOpen(event)}
        >
          {editable ? 'Bewerken' : 'Bekijken'}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
        {nextStatus && (
          <Button
            size="sm"
            className="flex-1 text-xs bg-[#ed6425] hover:bg-[#ed6425]/90 text-white border-0"
            onClick={() => onAdvanceStatus(event, nextStatus)}
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            {EVENT_STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}