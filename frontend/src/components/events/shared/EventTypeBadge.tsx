import { Badge } from '@/components/ui/badge';
import type { EventType } from '../../../types/event';
import { EVENT_TYPE_LABELS } from '../../../types/event';
import { Calendar, Wrench, FolderKanban } from 'lucide-react';

interface EventTypeBadgeProps {
  type: EventType;
  showIcon?: boolean;
}

const typeConfig: Record<EventType, { className: string; icon: React.ComponentType<any> }> = {
  event: {
    className: 'bg-[#041c3a] text-white border-[#041c3a]',
    icon: Calendar,
  },
  workshop: {
    className: 'bg-[#ed6425] text-white border-[#ed6425]',
    icon: Wrench,
  },
  project: {
    className: 'bg-[#041c3a]/70 text-white border-[#041c3a]/70',
    icon: FolderKanban,
  },
};

export function EventTypeBadge({ type, showIcon = false }: EventTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`${config.className} font-semibold tracking-widest uppercase text-[10px] px-2 py-0.5`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {EVENT_TYPE_LABELS[type]}
    </Badge>
  );
}