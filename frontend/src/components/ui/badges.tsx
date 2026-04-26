import { cn } from '@/lib/utils';
import type { EventStatus, EventType } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  concept: {
    label: 'Concept',
    className: 'bg-zinc-100 text-zinc-600',
  },
  voorbereid: {
    label: 'Voorbereid',
    className: 'bg-blue-50 text-blue-600',
  },
  afgerond: {
    label: 'Afgerond',
    className: 'bg-amber-50 text-amber-600',
  },
  compleet: {
    label: 'Compleet',
    className: 'bg-emerald-50 text-emerald-700',
  },
};

interface StatusBadgeProps {
  status: EventStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const typeConfig: Record<EventType, { label: string; className: string }> = {
  event: {
    label: 'Event',
    className: 'bg-indigo-50 text-indigo-600',
  },
  workshop: {
    label: 'Workshop',
    className: 'bg-violet-50 text-violet-600',
  },
  project: {
    label: 'Project',
    className: 'bg-teal-50 text-teal-600',
  },
};

interface TypeBadgeProps {
  type: EventType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = typeConfig[type];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}