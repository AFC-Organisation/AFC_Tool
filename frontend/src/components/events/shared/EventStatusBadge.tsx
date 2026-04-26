import { Badge } from '@/components/ui/badge';
import type { EventStatus } from '../../../types/event';
import { EVENT_STATUS_LABELS } from '../../../types/event';

interface EventStatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'default';
}

const statusConfig: Record<EventStatus, { className: string; dot: string }> = {
  concept: {
    className: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
    dot: 'bg-slate-400',
  },
  voorbereid: {
    className: 'bg-[#041c3a]/10 text-[#041c3a] border-[#041c3a]/20 hover:bg-[#041c3a]/10',
    dot: 'bg-[#041c3a]',
  },
  afgerond: {
    className: 'bg-[#ed6425]/10 text-[#ed6425] border-[#ed6425]/30 hover:bg-[#ed6425]/10',
    dot: 'bg-[#ed6425]',
  },
  compleet: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    dot: 'bg-emerald-500',
  },
};

export function EventStatusBadge({ status, size = 'default' }: EventStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`${config.className} font-semibold tracking-wide uppercase ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0 gap-1' : 'text-xs px-2 py-0.5 gap-1.5'
      }`}
    >
      <span className={`inline-block rounded-full ${config.dot} ${size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}