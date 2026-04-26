import { type LucideIcon, Plus, UploadCloud, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'default';
}

interface ActionCardProps {
  action: QuickAction;
}

function ActionCard({ action }: ActionCardProps) {
  const Icon = action.icon;

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all',
        action.disabled
          ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60'
          : action.variant === 'primary'
          ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-sm'
          : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          action.variant === 'primary'
            ? 'bg-indigo-500 text-white'
            : 'bg-zinc-100 text-zinc-600'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p
          className={cn(
            'text-sm font-semibold',
            action.variant === 'primary' ? 'text-indigo-700' : 'text-zinc-800'
          )}
        >
          {action.label}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
          {action.description}
        </p>
      </div>

      {action.disabled && (
        <span className="absolute right-3 top-3 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
          Binnenkort
        </span>
      )}
    </button>
  );
}

export function QuickActions() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: 'Nieuw evenement',
      description: 'Start een concept aan voor een event, workshop of project.',
      icon: Plus,
      variant: 'primary',
      disabled: false,
      onClick: () => navigate('/evenementen?nieuw=1'),
    },
  ];

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-zinc-700 uppercase tracking-wider">
        Snelle acties
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <ActionCard key={action.label} action={action} />
        ))}
      </div>
    </section>
  );
}