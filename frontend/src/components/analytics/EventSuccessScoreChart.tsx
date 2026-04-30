import type { EventSuccessScore } from '../../lib/analyticsUtils';

interface EventSuccessScoreChartProps {
  data: EventSuccessScore[];
}

const GRADE_CONFIG = {
  excellent: { label: 'Excellent',  bg: 'bg-green-100',  text: 'text-green-700',  bar: '#22c55e' },
  good:      { label: 'Goed',       bg: 'bg-blue-100',   text: 'text-blue-700',   bar: '#3b82f6' },
  average:   { label: 'Gemiddeld',  bg: 'bg-orange-100', text: 'text-orange-700', bar: '#ed6425' },
  low:       { label: 'Laag',       bg: 'bg-red-100',    text: 'text-red-700',    bar: '#ef4444' },
} as const;

export function EventSuccessScoreChart({ data }: EventSuccessScoreChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-slate-400">
        Geen evenementen beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {data.map((item) => {
        const cfg = GRADE_CONFIG[item.grade];
        return (
          <div key={item.titel} className="flex items-center gap-3">
            {/* Event name + type */}
            <div className="w-44 shrink-0">
              <p className="text-xs font-medium text-[#041c3a] truncate" title={item.titel}>
                {item.titel}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{item.type}</p>
            </div>

            {/* Score bar */}
            <div className="flex-1 relative h-5 bg-slate-100 rounded overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded transition-all duration-500 flex items-center"
                style={{ width: `${item.score}%`, backgroundColor: cfg.bar }}
              >
                {item.score > 20 && (
                  <span className="text-[10px] font-medium text-white pl-2">{item.score}</span>
                )}
              </div>
              {item.score <= 20 && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500">
                  {item.score}
                </span>
              )}
            </div>

            {/* Grade badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} shrink-0`}>
              {cfg.label}
            </span>

            {/* Check-in % */}
            <span className="text-[11px] text-slate-400 shrink-0 w-14 text-right">
              {item.checkInRate}% aanw.
            </span>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap pt-2 border-t border-slate-100">
        {(Object.entries(GRADE_CONFIG) as [keyof typeof GRADE_CONFIG, typeof GRADE_CONFIG[keyof typeof GRADE_CONFIG]][]).map(
          ([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: cfg.bar }}
              />
              <span className="text-[11px] text-slate-500">{cfg.label}</span>
            </div>
          )
        )}
        <span className="text-[11px] text-slate-400 ml-auto">Score = check-in × 0.5 + bezetting × 0.3 + bereik × 0.2</span>
      </div>
    </div>
  );
}