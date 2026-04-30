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

interface FacultyChartProps {
  data: DistributionItem[];
}

const COLORS = [
  '#ed6425',
  '#041c3a',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];

// Truncate long faculty names to avoid overflow
function truncate(label: string, maxLen = 28): string {
  return label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[220px]">
        {/* Show full untruncated label in tooltip */}
        <p className="font-semibold break-words">{payload[0]?.payload?.label}</p>
        <p className="text-slate-300">
          {payload[0]?.value} inschrijvingen ({payload[0]?.payload?.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function FacultyChart({ data }: FacultyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen faculteitsdata beschikbaar
      </div>
    );
  }

  // Each bar gets 36px height + 16px padding at top/bottom
  const chartHeight = data.length * 36 + 16;

  // Truncate labels for the axis — full label still shows in tooltip
  const displayData = data.map((d) => ({
    ...d,
    displayLabel: truncate(d.label),
  }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={displayData}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        barCategoryGap="25%"
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
          dataKey="displayLabel"
          width={140}
          tick={{ fontSize: 11, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}