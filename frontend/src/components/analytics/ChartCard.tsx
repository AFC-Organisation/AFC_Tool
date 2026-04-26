interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export function ChartCard({ title, subtitle, children, className = '', badge }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#041c3a]">{title}</h3>
            {badge && (
              <span className="text-[10px] font-semibold bg-[#041c3a]/8 text-[#041c3a]/60 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}