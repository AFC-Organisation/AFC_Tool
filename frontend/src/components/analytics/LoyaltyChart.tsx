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
import { Trophy, Medal, Award } from 'lucide-react';
import type { LoyaltyData } from '../../lib/analyticsUtils';

interface LoyaltyChartProps {
  data: LoyaltyData;
}

const BUCKET_COLORS = ['#94a3b8', '#60a5fa', '#34d399', '#ed6425', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload;
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-0.5">
        <p className="font-semibold">{d?.emoji} {d?.label}</p>
        <p className="text-slate-300">{d?.description}</p>
        <p className="text-[#ed6425] font-semibold">{d?.count} personen ({d?.percentage}%)</p>
      </div>
    );
  }
  return null;
};

function getRankIcon(index: number) {
  if (index === 0) return <Trophy className="h-4 w-4 text-amber-400" />;
  if (index === 1) return <Medal className="h-4 w-4 text-slate-400" />;
  if (index === 2) return <Award className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs font-bold text-slate-400 w-4 text-center">#{index + 1}</span>;
}

export function LoyaltyChart({ data }: LoyaltyChartProps) {
  if (!data || data.totalUnique === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen loyaliteitsdata beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-2xl font-bold text-[#041c3a]">{data.totalUnique.toLocaleString('nl-BE')}</p>
          <p className="text-xs text-slate-500 mt-0.5">unieke bezoekers</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-2xl font-bold text-[#ed6425]">{data.avgEventsPerPerson}</p>
          <p className="text-xs text-slate-500 mt-0.5">gem. events/persoon</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{data.maxEventsOnePersonAttended}</p>
          <p className="text-xs text-slate-500 mt-0.5">max events één persoon</p>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.buckets} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.buckets.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BUCKET_COLORS[index % BUCKET_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Bucket legend */}
      <div className="flex flex-wrap gap-2">
        {data.buckets.map((b, i) => (
          <div key={b.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: BUCKET_COLORS[i] }} />
            <span>{b.emoji} {b.label}</span>
          </div>
        ))}
      </div>

      {/* Superfan leaderboard */}
      {data.superfans.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#041c3a] mb-2 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Superfan leaderboard — top {data.superfans.length}
          </h4>
          <div className="space-y-1.5">
            {data.superfans.map((fan, i) => (
              <div
                key={fan.email}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                  i === 0 ? 'bg-amber-50 border border-amber-200' :
                  i === 1 ? 'bg-slate-50 border border-slate-200' :
                  i === 2 ? 'bg-orange-50 border border-orange-100' :
                  'bg-white border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 shrink-0">
                    {getRankIcon(i)}
                  </div>
                  <span className={`font-medium ${i < 3 ? 'text-[#041c3a]' : 'text-slate-600'}`}>
                    {fan.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#ed6425]">{fan.eventCount}</span>
                  <span className="text-slate-400">events</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}