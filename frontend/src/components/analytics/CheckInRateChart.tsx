import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { EventCheckInData } from '../../lib/analyticsUtils';

interface CheckInRateChartProps {
  data: EventCheckInData[];
}

function getBarColor(rate: number): string {
  if (rate >= 75) return '#10b981';
  if (rate >= 50) return '#ed6425';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload as EventCheckInData;
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-1 max-w-[200px]">
        <p className="font-semibold leading-tight">{d?.titel}</p>
        <p className="text-slate-300">
          {d?.checkedIn} / {d?.registrations} aanwezig
        </p>
        <p className="text-[#ed6425] font-semibold">{d?.checkInRate}% check-in</p>
      </div>
    );
  }
  return null;
};

export function CheckInRateChart({ data }: CheckInRateChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen evenementen beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 42)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="titel"
            width={140}
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <ReferenceLine x={75} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
          <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
          <Bar dataKey="checkInRate" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: '#475569', formatter: (v: number) => `${v}%` }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.checkInRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-8 border-t-2 border-dashed border-emerald-500" />
          ≥75% (goed)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-8 border-t-2 border-dashed border-amber-400" />
          ≥50% (matig)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400" />
          &lt;50% (laag)
        </div>
      </div>
    </div>
  );
}