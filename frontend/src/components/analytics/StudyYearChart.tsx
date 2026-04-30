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

// Map exact label strings to colors — must match computeStudyYearDistribution output
const COLOR_MAP: Record<string, string> = {
  'Bachelor 1': '#bfdbfe',   // blue-200
  'Bachelor 2': '#60a5fa',   // blue-400
  'Bachelor 3': '#2563eb',   // blue-600
  'Master 1':   '#ed6425',   // brand orange
  'Master 2':   '#c2410c',   // darker orange
  'Doctoraat':  '#041c3a',   // brand navy
};

function getBarColor(label: string): string {
  // Exact match first
  if (COLOR_MAP[label]) return COLOR_MAP[label];

  // Fallback: keyword-based (handles locale variants)
  const l = label.toLowerCase();
  if (l.includes('bachelor')) return '#60a5fa';
  if (l.includes('master'))   return '#ed6425';
  if (l.includes('doctoraat') || l.includes('phd')) return '#041c3a';
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
  // Filter out "Onbekend" here as a safety net (page also filters before passing)
  const filteredData = data.filter((d) => d.label !== 'Onbekend' && d.label !== 'Andere');

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen studiejaardata beschikbaar
      </div>
    );
  }

  // Recalculate percentages based on filtered total so bars reflect reality
  const filteredTotal = filteredData.reduce((sum, d) => sum + d.count, 0);
  const displayData = filteredData.map((d) => ({
    ...d,
    percentage: filteredTotal > 0 ? Math.round((d.count / filteredTotal) * 100) : 0,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={displayData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.label)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: 'Bachelor 1', color: '#bfdbfe' },
          { label: 'Bachelor 2', color: '#60a5fa' },
          { label: 'Bachelor 3', color: '#2563eb' },
          { label: 'Master 1',   color: '#ed6425' },
          { label: 'Master 2',   color: '#c2410c' },
          { label: 'Doctoraat',  color: '#041c3a' },
        ]
          .filter((l) => displayData.some((d) => d.label === l.label))
          .map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
              <span className="text-slate-400">
                ({displayData.find((d) => d.label === l.label)?.percentage ?? 0}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}