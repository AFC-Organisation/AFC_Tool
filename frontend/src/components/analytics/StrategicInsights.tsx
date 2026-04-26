import { TrendingUp, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { StrategicInsight } from '../../lib/analyticsUtils';

interface StrategicInsightsProps {
  insights: StrategicInsight[];
}

const TYPE_CONFIG = {
  positive: {
    icon: TrendingUp,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    label: 'Sterk punt',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-700',
    label: 'Aandachtspunt',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700',
    label: 'Inzicht',
  },
  opportunity: {
    icon: Lightbulb,
    bg: 'bg-[#ed6425]/8',
    border: 'border-[#ed6425]/25',
    iconBg: 'bg-[#ed6425]/15',
    iconColor: 'text-[#ed6425]',
    badgeBg: 'bg-[#ed6425]/15 text-[#ed6425]',
    label: 'Kans',
  },
};

export function StrategicInsights({ insights }: StrategicInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-slate-400">
        Onvoldoende data voor strategische inzichten
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight) => {
        const config = TYPE_CONFIG[insight.type];
        const Icon = config.icon;

        return (
          <div
            key={insight.id}
            className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg ${config.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${config.badgeBg}`}
                  >
                    {config.label}
                  </span>
                  {insight.metric && (
                    <span className="text-[10px] font-mono text-slate-500 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#041c3a] mb-0.5">
                  {insight.title}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}