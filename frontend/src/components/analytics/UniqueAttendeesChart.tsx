import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { UniqueAttendeesData } from '../../lib/analyticsUtils';

interface UniqueAttendeesChartProps {
  data: UniqueAttendeesData;
}

const CumulativeTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-0.5">
        <p className="font-semibold truncate max-w-[180px]">{label}</p>
        <p className="text-[#ed6425]">+{payload[1]?.value} nieuwe mensen</p>
        <p className="text-slate-300">{payload[0]?.value} totaal uniek</p>
      </div>
    );
  }
  return null;
};

export function UniqueAttendeesChart({ data }: UniqueAttendeesChartProps) {
  if (!data || data.totalUnique === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen data beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-[#041c3a]/5 rounded-xl">
          <p className="text-2xl font-bold text-[#041c3a]">{data.totalUnique.toLocaleString('nl-BE')}</p>
          <p className="text-xs text-slate-500 mt-0.5">unieke e-mails</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-2xl font-bold text-[#ed6425]">{data.totalRegistrations.toLocaleString('nl-BE')}</p>
          <p className="text-xs text-slate-500 mt-0.5">totale inschrijvingen</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{data.duplicateRate}%</p>
          <p className="text-xs text-slate-500 mt-0.5">herhaalde inschrijvingen</p>
        </div>
      </div>

      {/* Cumulative growth line */}
      {data.cumulativeUniqueOverEvents.length > 1 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
            Cumulatieve groei unieke bezoekers over evenementen
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={data.cumulativeUniqueOverEvents}
              margin={{ top: 0, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#041c3a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#041c3a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ed6425" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ed6425" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="event"
                tick={{ fontSize: 9, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CumulativeTooltip />} cursor={{ stroke: '#e2e8f0' }} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#041c3a"
                strokeWidth={2}
                fill="url(#cumulGrad)"
                dot={false}
                name="Cumulatief uniek"
              />
              <Area
                type="monotone"
                dataKey="newThisEvent"
                stroke="#ed6425"
                strokeWidth={2}
                fill="url(#newGrad)"
                dot={false}
                name="Nieuw dit event"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 border-t-2 border-[#041c3a]" /> Cumulatief uniek
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 border-t-2 border-[#ed6425]" /> Nieuwe bezoekers per event
            </div>
          </div>
        </div>
      )}

      {/* New vs returning bars */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
          Nieuwe vs. terugkerende bezoekers
        </p>
        <div className="space-y-3">
          {data.newVsReturning.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-bold text-[#041c3a]">{item.count.toLocaleString('nl-BE')} ({item.percentage}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.percentage}%`,
                    background: item.label.includes('Nieuwe') ? '#041c3a' : '#ed6425',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}