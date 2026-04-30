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
import type { ChannelEffectivenessData } from '../../lib/analyticsUtils';

interface ChannelEffectivenessChartProps {
  data: ChannelEffectivenessData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2 shadow-lg space-y-0.5">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-slate-300">{payload[0]?.value} inschrijvingen ({payload[0]?.payload?.shareOfRegistrations}%)</p>
        <p className="text-[#ed6425]">Check-in: {payload[0]?.payload?.checkInRate}%</p>
      </div>
    );
  }
  return null;
};

export function ChannelEffectivenessChart({ data }: ChannelEffectivenessChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-slate-400">
        Geen kanaaldata beschikbaar
      </div>
    );
  }

  const avgCheckInRate =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.checkInRate, 0) / data.length)
      : 0;

  return (
    <div className="space-y-4">
      {/* Volume chart */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium">Inschrijvingen per kanaal</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="registrations" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.6 + (entry.shareOfRegistrations / 100) * 0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Check-in rate per channel — horizontal bars ranked by quality */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium">
          Check-in rate per kanaal
          <span className="text-slate-400 ml-1">(gemiddeld: {avgCheckInRate}%)</span>
        </p>
        <div className="space-y-2">
          {[...data]
            .sort((a, b) => b.checkInRate - a.checkInRate)
            .map((item) => (
              <div key={item.channel} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-32 shrink-0 truncate">{item.channel}</span>
                <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${item.checkInRate}%`,
                      backgroundColor: item.checkInRate >= avgCheckInRate ? '#ed6425' : '#94a3b8',
                    }}
                  />
                </div>
                <span
                  className="text-xs font-medium w-10 text-right shrink-0"
                  style={{ color: item.checkInRate >= avgCheckInRate ? '#ed6425' : '#94a3b8' }}
                >
                  {item.checkInRate}%
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Table summary */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-1.5 text-slate-400 font-medium">Kanaal</th>
              <th className="text-right py-1.5 text-slate-400 font-medium">Inschrijvingen</th>
              <th className="text-right py-1.5 text-slate-400 font-medium">Aanwezig</th>
              <th className="text-right py-1.5 text-slate-400 font-medium">Check-in %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.channel} className="border-b border-slate-50">
                <td className="py-1.5 text-slate-600">{item.channel}</td>
                <td className="py-1.5 text-right text-slate-600">{item.registrations}</td>
                <td className="py-1.5 text-right text-slate-600">{item.checkedIn}</td>
                <td
                  className="py-1.5 text-right font-medium"
                  style={{ color: item.checkInRate >= avgCheckInRate ? '#ed6425' : '#94a3b8' }}
                >
                  {item.checkInRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}