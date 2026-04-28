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
import type { DistributionItem } from '../../lib/analyticsUtils';

interface StudyProgramChartProps {
  data: DistributionItem[];
}

function getProgramColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('data analytics'))       return '#6366f1';
  if (l.includes('finance'))              return '#0ea5e9';
  if (l.includes('operations'))           return '#14b8a6';
  if (l.includes('business engineering')) return '#041c3a';
  if (l.includes('business administration')) return '#475569';
  if (l.includes('handelswetenschappen') || l.includes('handelsingenieur')) return '#ed6425';
  if (l.includes('bedrijfsmanagement'))   return '#f97316';
  if (l.includes('accountancy') || l.includes('fiscaliteit')) return '#f59e0b';
  if (l.includes('economisch') || l.includes('economie') || l.includes('economics')) return '#eab308';
  if (l.includes('communicatie'))         return '#ec4899';
  if (l.includes('burgerlijk ingenieur') || l.includes('computer') || l.includes('engineering')) return '#8b5cf6';
  if (l.includes('psychologie'))          return '#a78bfa';
  if (l.includes('master') || l.includes('advanced')) return '#10b981';
  return '#94a3b8';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload as DistributionItem;
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-0.5 max-w-[220px]">
        <p className="font-semibold leading-snug">{d?.label}</p>
        <p className="text-[#ed6425] font-semibold">
          {d?.count} inschrijvingen
        </p>
        <p className="text-slate-300">{d?.percentage}% van totaal</p>
      </div>
    );
  }
  return null;
};

export function StudyProgramChart({ data }: StudyProgramChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen opleidingsdata beschikbaar
      </div>
    );
  }

  // Top 20 max
  const chartData = data.slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Business Engineering', color: '#041c3a' },
          { label: 'Data Analytics', color: '#6366f1' },
          { label: 'Finance', color: '#0ea5e9' },
          { label: 'Operations', color: '#14b8a6' },
          { label: 'Andere', color: '#94a3b8' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
            {c.label}
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 32)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 52, left: 0, bottom: 0 }}
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
            width={200}
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              fontSize: 10,
              fill: '#94a3b8',
              formatter: (v: number) => v,
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getProgramColor(entry.label)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {data.length > 20 && (
        <p className="text-xs text-slate-400 text-center">
          Top 20 getoond van {data.length} opleidingen
        </p>
      )}
    </div>
  );
}