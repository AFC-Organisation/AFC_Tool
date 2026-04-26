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

interface StudyYearChartProps {
  data: DistributionItem[];
}

function getBarColor(label: string): string {
  if (label.toLowerCase().includes('bachelor 1')) return '#bfdbfe';
  if (label.toLowerCase().includes('bachelor 2')) return '#93c5fd';
  if (label.toLowerCase().includes('bachelor 3')) return '#3b82f6';
  if (label.toLowerCase().includes('master 1')) return '#ed6425';
  if (label.toLowerCase().includes('master 2')) return '#c2410c';
  if (label.toLowerCase().includes('doctoraat')) return '#041c3a';
  return '#94a3b8';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-semibold">{payload[0]?.payload?.label}</p>
        <p className="text-slate-300">
          {payload[0]?.value} deelnemers ({payload[0]?.payload?.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function StudyYearChart({ data }: StudyYearChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen studiejaardata beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.label)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex gap-0.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-200" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          </div>
          Bachelor
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex gap-0.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ed6425]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#c2410c]" />
          </div>
          Master
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#041c3a]" />
          Doctoraat
        </div>
      </div>
    </div>
  );
}