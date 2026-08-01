import { BookOpen, Users, CheckCircle2 } from 'lucide-react';
import type { AcademicYearWithEvents } from '../types/academiejaar';

interface AcademicYearStatsBarProps {
  year: AcademicYearWithEvents;
}

export function AcademicYearStatsBar({ year }: AcademicYearStatsBarProps) {
  // AcademicYearStatsBar.tsx
const afgerond = year.events.filter((e) => e.status === 'afgerond' || e.status === 'compleet').length;

  const stats = [
    {
      icon: <BookOpen className="h-3.5 w-3.5" />,
      label: 'Evenementen',
      value: year.total_events,
      color: 'text-[#041c3a]',
      bg: 'bg-[#041c3a]/8',
      border: 'border-[#041c3a]/12',
    },
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: 'Inschrijvingen',
      value: year.total_registrations,
      color: 'text-[#ed6425]',
      bg: 'bg-[#ed6425]/8',
      border: 'border-[#ed6425]/15',
    },
    {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Afgerond',
      value: afgerond,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color} ${s.border}`}
        >
          {s.icon}
          <span className="font-bold">{s.value}</span>
          <span className="font-medium opacity-70">{s.label}</span>
        </div>
      ))}
    </div>
  );
}