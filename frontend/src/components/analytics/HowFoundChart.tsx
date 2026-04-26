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

interface HowFoundChartProps {
  data: DistributionItem[];
}

const COLORS = ['#ed6425', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-semibold">{payload[0]?.payload?.label}</p>
        <p className="text-slate-300">
          {payload[0]?.value} personen ({payload[0]?.payload?.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function HowFoundChart({ data }: HowFoundChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen data beschikbaar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 0, right: 8, left: -16, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}