// ─── StatsCard ───────────────────────────────────────────────────────────────

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  accent?: 'orange' | 'navy' | 'teal' | 'rose';
  loading?: boolean;
}

const accentMap = {
  orange: {
    iconWrapper: 'bg-[#ed6425] text-white shadow-md shadow-[#ed6425]/30',
    border: 'border-l-[#ed6425]',
    label: 'text-[#ed6425]',
  },
  navy: {
    iconWrapper: 'bg-[#041c3a] text-white shadow-md shadow-[#041c3a]/20',
    border: 'border-l-[#041c3a]',
    label: 'text-[#041c3a]',
  },
  teal: {
    iconWrapper: 'bg-teal-500 text-white shadow-md shadow-teal-500/25',
    border: 'border-l-teal-500',
    label: 'text-teal-600',
  },
  rose: {
    iconWrapper: 'bg-rose-500 text-white shadow-md shadow-rose-500/25',
    border: 'border-l-rose-500',
    label: 'text-rose-500',
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  accent = 'orange',
  loading = false,
}: StatsCardProps) {
  const colors = accentMap[accent] ?? accentMap['orange'];

  return (
    <div
      className={cn(
        'relative rounded-xl border border-zinc-200/80 bg-white p-5 flex flex-col gap-3 overflow-hidden',
        'border-l-2',
        colors.border,
        'transition-shadow hover:shadow-md hover:shadow-zinc-900/6'
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] -translate-y-4 translate-x-4">
        <Icon className="w-full h-full" />
      </div>

      <div className="flex items-start justify-between">
        <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colors.iconWrapper)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-20 rounded-md bg-zinc-100 animate-pulse" />
      ) : (
        <p className="text-4xl font-black tracking-tight text-[#041c3a] leading-none">
          {value}
        </p>
      )}

      {description && (
        <p className="text-[11px] text-zinc-400 mt-auto border-t border-zinc-100 pt-2.5">
          {description}
        </p>
      )}
    </div>
  );
}


// ─── StatsGrid ───────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { CalendarDays, Users, CalendarCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types/index';

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: currentYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('is_huidig', true)
        .maybeSingle();

      if (!currentYear) {
        setLoading(false);
        return;
      }

      const yearId = currentYear.id;
      const today = new Date().toISOString().split('T')[0];

      const [totaalRes, komendeRes, inschrijvingenRes] = await Promise.all([
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('academic_year_id', yearId),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('academic_year_id', yearId)
          .gte('event_datum', today)
          .in('status', ['concept', 'voorbereid']),
        supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totaal_evenementen: totaalRes.count ?? 0,
        komende_evenementen: komendeRes.count ?? 0,
        totaal_inschrijvingen: inschrijvingenRes.count ?? 0,
        totaal_feedback: 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatsCard
        label="Evenementen dit jaar"
        value={stats?.totaal_evenementen ?? 0}
        icon={CalendarDays}
        accent="orange"
        loading={loading}
        description="In het huidige academiejaar"
      />
      <StatsCard
        label="Komende evenementen"
        value={stats?.komende_evenementen ?? 0}
        icon={CalendarCheck}
        accent="navy"
        loading={loading}
        description="Gepland en nog niet afgerond"
      />
      <StatsCard
        label="Totaal inschrijvingen"
        value={stats?.totaal_inschrijvingen ?? 0}
        icon={Users}
        accent="teal"
        loading={loading}
        description="Over alle evenementen"
      />
    </div>
  );
}