import { useEffect, useState } from 'react';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AcademicYear } from '@/types';

export function AcademicYearBanner() {
  const [year, setYear] = useState<AcademicYear | null>(null);

  useEffect(() => {
    supabase
      .from('academic_years')
      .select('*')
      .eq('is_huidig', true)
      .maybeSingle()
      .then(({ data }) => setYear(data));
  }, []);

  if (!year) return null;

  return (
    <div className="relative flex items-center justify-between rounded-xl overflow-hidden bg-[#041c3a] px-5 py-4">
      {/* Decorative right-side glow */}
      <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-[#ed6425]/15 to-transparent pointer-events-none" />
      <div className="absolute right-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[#ed6425]/10 blur-xl pointer-events-none" />

      <div className="flex items-center gap-3">
        {/* Icon badge */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ed6425]/15 border border-[#ed6425]/25">
          <GraduationCap className="h-4 w-4 text-[#ed6425]" />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 leading-none mb-1">
            Huidig academiejaar
          </p>
          <p className="text-sm font-bold text-white tracking-tight">
            {year.naam}
          </p>
        </div>
      </div>

      {/* Right indicator */}
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#ed6425] animate-pulse" />
        <span className="text-[11px] font-medium text-white/50">Actief</span>
        <ChevronRight className="h-3.5 w-3.5 text-white/25 ml-1" />
      </div>
    </div>
  );
}