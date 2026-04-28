import type { FunFact } from '../../lib/analyticsUtils';

interface FunFactsGridProps {
  facts: FunFact[];
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; value: string }> = {
  orange: { bg: 'bg-orange-50',  border: 'border-orange-200', value: 'text-[#ed6425]' },
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',   value: 'text-blue-600'  },
  green:  { bg: 'bg-emerald-50', border: 'border-emerald-200',value: 'text-emerald-600'},
  purple: { bg: 'bg-purple-50',  border: 'border-purple-200', value: 'text-purple-600' },
  pink:   { bg: 'bg-pink-50',    border: 'border-pink-200',   value: 'text-pink-600'  },
};

export function FunFactsGrid({ facts }: FunFactsGridProps) {
  if (facts.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((fact) => {
        const cls = COLOR_CLASSES[fact.color] ?? COLOR_CLASSES.blue;
        return (
          <div
            key={fact.id}
            className={`rounded-xl border p-4 ${cls.bg} ${cls.border} flex items-start gap-3`}
          >
            <span className="text-2xl leading-none shrink-0 mt-0.5">{fact.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                {fact.title}
              </p>
              <p className={`text-base font-bold leading-tight ${cls.value} mb-1 truncate`}>
                {fact.value}
              </p>
              <p className="text-xs text-slate-500 leading-snug">{fact.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}