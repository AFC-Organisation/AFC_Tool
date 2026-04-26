import { Users, TrendingUp, CheckSquare, Zap, Calendar } from 'lucide-react';
import type { KPIData } from '../../lib/analyticsUtils';

interface AnalyticsKPICardsProps {
  kpis: KPIData;
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
  highlight?: 'green' | 'orange' | 'red' | 'blue';
}

function KPICard({ label, value, sub, icon, accent, highlight }: KPICardProps) {
  const highlightClasses = {
    green: 'border-l-emerald-400 bg-emerald-50/60',
    orange: 'border-l-[#ed6425] bg-orange-50/60',
    red: 'border-l-red-400 bg-red-50/60',
    blue: 'border-l-blue-400 bg-blue-50/60',
  };

  return (
    <div
      className={`relative rounded-xl border border-slate-200 bg-white p-5 border-l-4 transition-shadow hover:shadow-md ${
        highlight ? highlightClasses[highlight] : 'border-l-[#041c3a]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-tight">
          {label}
        </p>
        <div
          className={`flex items-center justify-center h-8 w-8 rounded-lg ${
            accent ? 'bg-[#ed6425]' : 'bg-[#041c3a]/8'
          }`}
        >
          <span className={accent ? 'text-white' : 'text-[#041c3a]/60'}>
            {icon}
          </span>
        </div>
      </div>
      <p className="text-3xl font-bold text-[#041c3a] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export function AnalyticsKPICards({ kpis }: AnalyticsKPICardsProps) {
  const checkInHighlight =
    kpis.checkInRate >= 75
      ? 'green'
      : kpis.checkInRate < 50 && kpis.checkInRate > 0
      ? 'red'
      : 'blue';

  const capacityHighlight =
    kpis.capacityUtilization != null
      ? kpis.capacityUtilization >= 90
        ? 'orange'
        : kpis.capacityUtilization < 60
        ? 'red'
        : 'green'
      : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KPICard
        label="Evenementen"
        value={kpis.totalEvents.toString()}
        sub="compleet afgerond"
        icon={<Calendar className="h-4 w-4" />}
      />
      <KPICard
        label="Inschrijvingen"
        value={kpis.totalRegistrations.toLocaleString('nl-BE')}
        sub={`gem. ${kpis.avgRegistrationsPerEvent} per event`}
        icon={<Users className="h-4 w-4" />}
        accent
      />
      <KPICard
        label="Aanwezigen"
        value={kpis.totalCheckedIn.toLocaleString('nl-BE')}
        sub="effectief aanwezig"
        icon={<CheckSquare className="h-4 w-4" />}
      />
      <KPICard
        label="Check-in rate"
        value={kpis.checkInRate > 0 ? `${kpis.checkInRate}%` : '—'}
        sub="aanwezig / ingeschreven"
        icon={<TrendingUp className="h-4 w-4" />}
        highlight={checkInHighlight as 'green' | 'blue' | 'red'}
      />
      <KPICard
        label="Bezettingsgraad"
        value={
          kpis.capacityUtilization != null ? `${kpis.capacityUtilization}%` : '—'
        }
        sub={
          kpis.capacityUtilization != null
            ? 'van max. capaciteit'
            : 'geen capaciteitslimiet'
        }
        icon={<Zap className="h-4 w-4" />}
        highlight={capacityHighlight}
      />
    </div>
  );
}