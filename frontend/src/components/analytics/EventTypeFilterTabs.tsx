import type { EventTypeFilter } from '../../hooks/useAnalytics';
import type { AnalyticsEvent } from '../../hooks/useAnalytics';

interface EventTypeFilterProps {
  selected: EventTypeFilter;
  onChange: (type: EventTypeFilter) => void;
  allEvents: AnalyticsEvent[];
}

const TYPES: { value: EventTypeFilter; label: string; color: string }[] = [
  { value: 'all', label: 'Alle types', color: '#041c3a' },
  { value: 'event', label: 'Events', color: '#ed6425' },
  { value: 'workshop', label: 'Workshops', color: '#0ea5e9' },
  { value: 'project', label: 'Projecten', color: '#10b981' },
];

export function EventTypeFilterTabs({
  selected,
  onChange,
  allEvents,
}: EventTypeFilterProps) {
  const counts: Record<string, number> = {
    all: allEvents.length,
    event: allEvents.filter((e) => e.type === 'event').length,
    workshop: allEvents.filter((e) => e.type === 'workshop').length,
    project: allEvents.filter((e) => e.type === 'project').length,
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TYPES.map((t) => {
        const isActive = selected === t.value;
        const count = counts[t.value] ?? 0;

        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            disabled={count === 0 && t.value !== 'all'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${
              isActive
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            style={isActive ? { backgroundColor: t.color } : {}}
          >
            <span>{t.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}