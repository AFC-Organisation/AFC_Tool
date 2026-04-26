import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Wrench,
  FolderKanban,
  Plus,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileEdit,
} from 'lucide-react';
import { EventCard } from '../shared/EventCard';
import type { Event, EventType, EventStatus } from '../../../types/event';
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, STATUS_ORDER } from '../../../types/event';

interface EventsOverviewProps {
  events: Event[];
  onNewEvent: () => void;
  onOpenEvent: (event: Event) => void;
  onAdvanceStatus: (event: Event, newStatus: EventStatus) => void;
}

const typeIcons: Record<EventType, React.ComponentType<any>> = {
  event: Calendar,
  workshop: Wrench,
  project: FolderKanban,
};

// AFC color per type
const typeStyle: Record<EventType, { header: string; icon: string; border: string; emptyIcon: string }> = {
  event: {
    header: 'bg-[#041c3a] text-white border-[#041c3a]',
    icon: 'text-white',
    border: 'border-[#041c3a]/20',
    emptyIcon: 'text-[#041c3a]/30',
  },
  workshop: {
    header: 'bg-[#ed6425] text-white border-[#ed6425]',
    icon: 'text-white',
    border: 'border-[#ed6425]/20',
    emptyIcon: 'text-[#ed6425]/30',
  },
  project: {
    header: 'bg-[#041c3a]/70 text-white border-[#041c3a]/70',
    icon: 'text-white',
    border: 'border-[#041c3a]/15',
    emptyIcon: 'text-[#041c3a]/25',
  },
};

const statusIconMap: Record<EventStatus, React.ComponentType<any>> = {
  concept: FileEdit,
  voorbereid: Clock,
  afgerond: TrendingUp,
  compleet: CheckCircle2,
};

const statusCardStyle: Record<EventStatus, { active: string; inactive: string; icon: string }> = {
  concept: {
    active: 'bg-slate-800 text-white border-slate-800',
    inactive: 'bg-white border-slate-200 hover:border-slate-300',
    icon: 'text-slate-400',
  },
  voorbereid: {
    active: 'bg-[#041c3a] text-white border-[#041c3a]',
    inactive: 'bg-white border-slate-200 hover:border-[#041c3a]/30',
    icon: 'text-[#041c3a]',
  },
  afgerond: {
    active: 'bg-[#ed6425] text-white border-[#ed6425]',
    inactive: 'bg-white border-slate-200 hover:border-[#ed6425]/30',
    icon: 'text-[#ed6425]',
  },
  compleet: {
    active: 'bg-emerald-700 text-white border-emerald-700',
    inactive: 'bg-white border-slate-200 hover:border-emerald-300',
    icon: 'text-emerald-600',
  },
};

export function EventsOverview({
  events,
  onNewEvent,
  onOpenEvent,
  onAdvanceStatus,
}: EventsOverviewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const types: EventType[] = ['event', 'workshop', 'project'];

  const filtered = events.filter((e) => {
    const matchSearch = !search || e.titel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCounts = {
    total: events.length,
    concept: events.filter((e) => e.status === 'concept').length,
    voorbereid: events.filter((e) => e.status === 'voorbereid').length,
    afgerond: events.filter((e) => e.status === 'afgerond').length,
    compleet: events.filter((e) => e.status === 'compleet').length,
  };

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUS_ORDER.map((status) => {
          const Icon = statusIconMap[status];
          const count = statCounts[status];
          const style = statusCardStyle[status];
          const isActive = statusFilter === status;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? 'all' : status)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-150 shadow-sm hover:shadow-md ${
                isActive ? style.active : style.inactive
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white/80' : style.icon}`}
                />
                <span
                  className={`text-3xl font-black tabular-nums ${
                    isActive ? 'text-white' : 'text-[#041c3a]'
                  }`}
                >
                  {count}
                </span>
              </div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  isActive ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                {EVENT_STATUS_LABELS[status]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters + New button */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Zoek evenementen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px] border-slate-200 focus:ring-[#041c3a]/30">
            <SelectValue placeholder="Alle statussen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={onNewEvent}
          className="bg-[#ed6425] hover:bg-[#ed6425]/90 text-white gap-2 font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nieuw evenement
        </Button>
      </div>

      {/* Types grouped */}
      {types.map((type) => {
        const typeEvents = filtered.filter((e) => e.type === type);
        if (typeEvents.length === 0 && search) return null;

        const Icon = typeIcons[type];
        const style = typeStyle[type];

        return (
          <section key={type}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm uppercase tracking-wide ${style.header}`}
              >
                <Icon className={`w-4 h-4 ${style.icon}`} />
                {EVENT_TYPE_LABELS[type]}s
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-semibold bg-slate-100 text-slate-600"
              >
                {typeEvents.length} {typeEvents.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            {typeEvents.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center ${style.border} bg-slate-50/50`}
              >
                <Icon className={`w-10 h-10 mx-auto mb-3 ${style.emptyIcon}`} />
                <p className="text-sm text-slate-400 font-medium">
                  Geen {EVENT_TYPE_LABELS[type].toLowerCase()}s dit academiejaar
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-slate-500 hover:text-[#041c3a] hover:bg-[#041c3a]/5"
                  onClick={onNewEvent}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Voeg toe
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {typeEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onOpen={onOpenEvent}
                    onAdvanceStatus={onAdvanceStatus}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Geen evenementen gevonden</p>
          <p className="text-sm mt-1 opacity-70">Probeer een andere zoekterm</p>
        </div>
      )}
    </div>
  );
}