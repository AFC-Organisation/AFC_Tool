import type { RetentionFunnelData } from '../../lib/analyticsUtils';

interface RetentionFunnelChartProps {
  data: RetentionFunnelData;
}

export function RetentionFunnelChart({ data }: RetentionFunnelChartProps) {
  if (data.stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-slate-400">
        Geen retentiedata beschikbaar
      </div>
    );
  }

  const maxCount = data.stages[0].count;

  return (
    <div className="space-y-4 py-2">
      {data.stages.map((stage, i) => {
        const widthPct = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
        return (
          <div key={stage.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#041c3a]">{stage.label}</span>
              <span className="text-slate-500">
                {stage.count.toLocaleString()} ({stage.percentage}%)
              </span>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500 flex items-center pl-3"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? '2rem' : '0',
                }}
              >
                {widthPct > 20 && (
                  <span className="text-xs font-medium text-white">
                    {stage.count.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Drop-off arrow between stages */}
            {i < data.stages.length - 1 && (
              <div className="flex items-center gap-2 pl-1 pt-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v8M4 8l3 3 3-3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] text-slate-400">
                  {i === 0
                    ? `${data.dropOffRegistrationToCheckIn}% no-show`
                    : `${data.dropOffCheckInToReturn}% enkelvoudige bezoeker`}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Summary callout */}
      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
        <div className="rounded-lg bg-orange-50 px-3 py-2 text-center">
          <div className="text-lg font-bold text-[#ed6425]">
            {data.stages[1]?.percentage ?? 0}%
          </div>
          <div className="text-[11px] text-orange-600">verschijnt na inschrijving</div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <div className="text-lg font-bold text-[#041c3a]">
            {data.stages[2]?.percentage ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500">komt terug voor meer dan 1 event</div>
        </div>
      </div>
    </div>
  );
}