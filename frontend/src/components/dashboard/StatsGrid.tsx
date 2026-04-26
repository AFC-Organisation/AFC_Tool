import { useEffect, useState } from 'react';
import { CalendarDays, Users, MessageSquare, CalendarCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types/index';
import { StatsCard } from './StatsCard';

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Haal huidig academiejaar op
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

      // Parallel queries
      const [totaalRes, komendeRes, inschrijvingenRes, feedbackRes] = await Promise.all([
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
        supabase
          .from('feedback')
          .select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totaal_evenementen: totaalRes.count ?? 0,
        komende_evenementen: komendeRes.count ?? 0,
        totaal_inschrijvingen: inschrijvingenRes.count ?? 0,
        totaal_feedback: feedbackRes.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Evenementen dit jaar"
        value={stats?.totaal_evenementen ?? 0}
        icon={CalendarDays}
        accent="indigo"
        loading={loading}
        description="In het huidige academiejaar"
      />
      <StatsCard
        label="Komende evenementen"
        value={stats?.komende_evenementen ?? 0}
        icon={CalendarCheck}
        accent="emerald"
        loading={loading}
        description="Gepland en nog niet afgerond"
      />
      <StatsCard
        label="Totaal inschrijvingen"
        value={stats?.totaal_inschrijvingen ?? 0}
        icon={Users}
        accent="amber"
        loading={loading}
        description="Over alle evenementen"
      />
    </div>
  );
}