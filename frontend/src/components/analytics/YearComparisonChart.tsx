import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { YearSummary } from '../../hooks/useAnalytics';

interface YearComparisonChartProps {
  summaries: YearSummary[];
  selectedYearId: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-1">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}{p.dataKey === 'avgCheckInRate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function YearComparisonChart({ summaries, selectedYearId }: YearComparisonChartProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen jaardata beschikbaar
      </div>
    );
  }

  const data = [...summaries]
    .sort((a, b) => a.year.start_datum.localeCompare(b.year.start_datum))
    .map((s) => ({
      naam: s.year.naam,
      Inschrijvingen: s.totalRegistrations,
      Aanwezig: s.totalCheckedIn,
      avgCheckInRate: s.avgCheckInRate,
      isSelected: s.year.id === selectedYearId,
    }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="naam"
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }}
          />
          <Bar dataKey="Inschrijvingen" fill="#041c3a" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Aanwezig" fill="#ed6425" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Year summary table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 font-medium text-slate-400">Academiejaar</th>
              <th className="text-right py-2 px-3 font-medium text-slate-400">Events</th>
              <th className="text-right py-2 px-3 font-medium text-slate-400">Inschrijvingen</th>
              <th className="text-right py-2 px-3 font-medium text-slate-400">Aanwezig</th>
              <th className="text-right py-2 pl-3 font-medium text-slate-400">Check-in %</th>
            </tr>
          </thead>
          <tbody>
            {summaries
              .sort((a, b) => b.year.start_datum.localeCompare(a.year.start_datum))
              .map((s) => (
                <tr
                  key={s.year.id}
                  className={`border-b border-slate-50 ${
                    s.year.id === selectedYearId ? 'bg-[#041c3a]/5' : ''
                  }`}
                >
                  <td className="py-2 pr-4 font-medium text-[#041c3a]">
                    {s.year.naam}
                    {s.year.is_huidig && (
                      <span className="ml-1.5 text-[#ed6425] text-[10px] font-semibold">
                        HUIDIG
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3 text-slate-600">{s.totalEvents}</td>
                  <td className="text-right py-2 px-3 text-slate-600">
                    {s.totalRegistrations.toLocaleString('nl-BE')}
                  </td>
                  <td className="text-right py-2 px-3 text-slate-600">
                    {s.totalCheckedIn.toLocaleString('nl-BE')}
                  </td>
                  <td className="text-right py-2 pl-3">
                    <span
                      className={`font-semibold ${
                        s.avgCheckInRate >= 75
                          ? 'text-emerald-600'
                          : s.avgCheckInRate >= 50
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    >
                      {s.avgCheckInRate > 0 ? `${s.avgCheckInRate}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}