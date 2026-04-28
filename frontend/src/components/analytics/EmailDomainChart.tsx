import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { GraduationCap } from 'lucide-react';
import type { EmailDomainData } from '../../lib/analyticsUtils';

interface EmailDomainChartProps {
  data: EmailDomainData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload as EmailDomainData;
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-0.5">
        <p className="font-semibold">@{d?.label}</p>
        {d?.isUniversity && (
          <p className="text-emerald-400 text-[10px]">🎓 Universiteitsdomein</p>
        )}
        <p className="text-[#ed6425]">{d?.count} inschrijvingen ({d?.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function EmailDomainChart({ data }: EmailDomainChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen e-maildomein data beschikbaar
      </div>
    );
  }

  const uniCount = data.filter((d) => d.isUniversity).reduce((s, d) => s + d.count, 0);
  const total = data.reduce((s, d) => s + d.count, 0);
  const uniPct = total > 0 ? Math.round((uniCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* University vs other summary */}
      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-700">{uniPct}% universitaire e-mails</p>
          <p className="text-xs text-emerald-600">
            {uniCount} van {total} inschrijvingen via een @univ.be adres
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 28)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `@${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#94a3b8', formatter: (v: number) => v }}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isUniversity ? '#10b981' : '#041c3a'}
                opacity={entry.isUniversity ? 0.85 : 0.5 + (index === 0 ? 0.5 : 0.3 - index * 0.02)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          Universitair e-mailadres
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#041c3a] opacity-60" />
          Persoonlijk e-mailadres
        </div>
      </div>
    </div>
  );
}