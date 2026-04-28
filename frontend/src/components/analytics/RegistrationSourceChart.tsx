import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DistributionItem } from '../../lib/analyticsUtils';

interface RegistrationSourceChartProps {
  data: DistributionItem[];
}

const COLORS = ['#ed6425', '#041c3a', '#0ea5e9'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#041c3a] text-white text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-semibold">{payload[0]?.name}</p>
        <p className="text-slate-300">
          {payload[0]?.value} ({payload[0]?.payload?.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percentage,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percentage < 8) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${Math.round(percentage)}%`}
    </text>
  );
};

export function RegistrationSourceChart({ data }: RegistrationSourceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Geen brondata beschikbaar
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.label, value: d.count, percentage: d.percentage }));

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend */}
      <div className="flex flex-col gap-2 w-full mt-1">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#041c3a]">{item.count}</span>
              <span className="text-xs text-slate-400 ml-1">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}