import {
  Calendar, MapPin, Users, Clock, FileText, Globe, Share2,
  Package, Mic, MessageSquare, ChevronDown, ChevronUp, User,
  Phone, Mail, CheckCircle2, XCircle, UserCheck, Info,
  Layers, BookOpen, Building2, Search, Download, Euro,
  TrendingUp, TrendingDown, Archive,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { EventWithRegistrations } from '../types/academiejaar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Domain {
  id: string;
  naam: string;
  created_at?: string | null;
}

interface Speaker {
  id: string;
  naam: string;
  rol: string;
  email?: string | null;
  telefoon?: string | null;
  omschrijving?: string | null;
  volgorde?: number | null;
  created_at?: string | null;
}

interface Registration {
  id: string;
  bron?: string | null;
  email?: string | null;
  faculteit?: string | null;
  hoe_gevonden?: string | null;
  voornaam?: string | null;
  achternaam?: string | null;
  studiejaar?: string | null;
  naam?: string | null;
  ingeschreven_op?: string | null;
  ingediend_op?: string | null;
  checked_in?: boolean | null;
  registered_at?: string | null;
}

interface Feedback {
  id: string;
  email?: string | null;
  schaal_1?: number | null;
  schaal_2?: number | null;
  schaal_3?: number | null;
  wat_kon_beter?: string | null;
  favo_onderdeel?: string | null;
  andere_opmerkingen?: string | null;
  created_at?: string | null;
}

interface AcademicYear {
  id?: string;
  naam: string;
  start_datum?: string | null;
  eind_datum?: string | null;
  is_huidig?: boolean | null;
  created_at?: string | null;
}

interface EventRolUser {
  user_id: string;
  user_email?: string | null;
  user_naam?: string | null;
}

interface EventRol {
  id: string;
  naam: string;
  beschrijving?: string | null;
  uren: string;
  plaatsen: number;
  is_default: boolean;
  toegewezen?: EventRolUser[];
}


interface FullEvent extends EventWithRegistrations {
  academic_year?: AcademicYear | null;
  domains?: Domain[];
  // accept both key names that Supabase might return
  speakers?: Speaker[];
  event_sprekers?: Speaker[];
  registrations?: Registration[];
  feedback?: Feedback[];
  // new fields from form & upload
  financieel_resultaat?: number | null;
  event_rollen?: EventRol[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string; label: string }> = {
  concept:      { bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-200',  label: 'Concept' },
  voorbereid:   { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  border: 'border-violet-100', label: 'Voorbereid' },
  gepubliceerd: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    border: 'border-blue-100',   label: 'Gepubliceerd' },
  afgerond:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100',label: 'Afgerond' },
  geannuleerd:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400',     border: 'border-red-100',    label: 'Geannuleerd' },
  compleet:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100',label: 'Compleet' },
};

const TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  lezing:   'Lezing',
  project:  'Project',
  event:    'Event',
  andere:   'Andere',
};

const ROL_LABELS: Record<string, string> = {
  spreker:     'Spreker',
  moderator:   'Moderator',
  panellid:    'Panellid',
  gastspreker: 'Gastspreker',
  begeleider:  'Begeleider',
};

const RATING_LABELS: Record<string, string> = {
  schaal_1: 'Algemene tevredenheid',
  schaal_2: 'Inhoudelijke kwaliteit',
  schaal_3: 'Organisatie',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateShort(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('nl-BE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(t: string | null | undefined): string {
  if (!t) return '—';
  return t.slice(0, 5);
}

function avg(nums: (number | null | undefined)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (!valid.length) return null;
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1));
}

function fullName(r: Registration): string {
  const parts = [r.voornaam, r.achternaam].filter(Boolean);
  return parts.length ? parts.join(' ') : r.naam ?? r.email ?? '—';
}

function exportRegistrationsCSV(registrations: Registration[], eventTitle: string) {
  const headers = ['Naam', 'Email', 'Faculteit', 'Studiejaar', 'Bron', 'Hoe gevonden', 'Ingeschreven op', 'Ingediend op', 'Check-in'];
  const rows = registrations.map(r => [
    fullName(r),
    r.email ?? '',
    r.faculteit ?? '',
    r.studiejaar ?? '',
    r.bron ?? '',
    r.hoe_gevonden ?? '',
    r.ingeschreven_op ? formatDateTime(r.ingeschreven_op) : formatDateTime(r.registered_at),
    r.ingediend_op ? formatDateTime(r.ingediend_op) : '',
    r.checked_in ? 'Ja' : 'Nee',
  ]);
  const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `registraties-${eventTitle.toLowerCase().replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ icon, children, badge }: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  badge?: string | number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-[#ed6425]">{icon}</span>}
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 whitespace-nowrap">
        {children}
      </h3>
      {badge != null && (
        <span className="bg-[#ed6425] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Pill({ children, color = 'orange' }: {
  children: React.ReactNode;
  color?: 'orange' | 'blue' | 'indigo' | 'slate' | 'emerald' | 'red' | 'amber' | 'violet';
}) {
  const map = {
    orange:  'bg-[#ed6425]/10 text-[#ed6425] border-[#ed6425]/20',
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red:     'bg-red-50 text-red-600 border-red-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    violet:  'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-semibold border ${map[color]}`}>
      {children}
    </span>
  );
}

function MetaField({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-[#041c3a] ${mono ? 'font-mono text-[10px] text-slate-400 break-all' : ''}`}>
        {value ?? <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

function Collapsible({ title, icon, count, defaultOpen = true, children, actions }: {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center bg-slate-50 hover:bg-slate-100 transition-colors">
        <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-2 px-4 py-3 text-left">
          <span className="flex items-center gap-2 text-xs font-bold text-[#041c3a] uppercase tracking-wide">
            {icon && <span className="text-[#ed6425]">{icon}</span>}
            {title}
            {count != null && (
              <span className="bg-[#ed6425]/10 text-[#ed6425] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                {count}
              </span>
            )}
          </span>
        </button>
        {actions && <div className="flex items-center gap-1 pr-3">{actions}</div>}
        <button onClick={() => setOpen(o => !o)} className="px-3 py-3">
          {open
            ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
        </button>
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function StarRating({ value, max = 5 }: { value: number | null | undefined; max?: number }) {
  if (value == null) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-base leading-none ${i < Math.round(value) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
      ))}
      <span className="text-xs text-slate-500 ml-1.5 font-semibold">{value}/{max}</span>
    </span>
  );
}

function RatingBar({ value, max = 5, label }: { value: number | null; max?: number; label: string }) {
  const pct = value != null ? (value / max) * 100 : 0;
  const color = value == null ? 'bg-slate-200' : value >= 4 ? 'bg-emerald-400' : value >= 3 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] text-slate-500 font-semibold w-36 shrink-0">{label}</p>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[#041c3a] w-8 text-right">{value ?? '—'}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
      <p className="text-xs text-slate-400 italic">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Financial section
// ─────────────────────────────────────────────────────────────────────────────

function FinancieelSection({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <div>
      <SectionTitle icon={<Euro className="h-4 w-4" />}>Financieel resultaat</SectionTitle>
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border ${
          isPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-8 w-8 text-emerald-500 shrink-0" />
        ) : (
          <TrendingDown className="h-8 w-8 text-red-500 shrink-0" />
        )}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {isPositive ? 'Winst' : 'Verlies'}
          </p>
          <p className={`text-3xl font-extrabold ${isPositive ? 'text-emerald-700' : 'text-red-600'}`}>
            € {value.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Crew section
// ─────────────────────────────────────────────────────────────────────────────

function CrewSection({ rollen }: { rollen: EventRol[] }) {
  const totalAssigned = rollen.reduce((sum, r) => sum + (r.toegewezen?.length ?? 0), 0);

  return (
    <div>
      <SectionTitle icon={<Users className="h-4 w-4" />} badge={totalAssigned}>
        Shiftenlijst
      </SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        {rollen.map((rol) => {
          const count = rol.toegewezen?.length ?? 0;
          const full = !rol.is_default && count >= rol.plaatsen;
          return (
            <div key={rol.id} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">{rol.naam}</p>
                  {rol.is_default && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#ed6425]/10 text-[#ed6425]">
                      Standaard
                    </span>
                  )}
                </div>
                {rol.uren && <p className="text-[10px] text-slate-400 mt-0.5">{rol.uren}</p>}
              </div>

              <div className="p-3 space-y-2">
                {!rol.is_default && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Plaatsen</span>
                    <span className={full ? 'text-red-500' : ''}>{count} / {rol.plaatsen}</span>
                  </div>
                )}

                {count === 0 ? (
                  <p className="text-[11px] text-slate-300 italic">Nog niemand toegewezen</p>
                ) : (
                  <div className="space-y-1.5">
                    {rol.toegewezen!.map((t) => {
                      const name = t.user_naam ?? t.user_email?.split('@')[0] ?? 'Gebruiker';
                      return (
                        <div key={t.user_id} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#041c3a]/10 flex items-center justify-center text-[10px] font-bold text-[#041c3a] shrink-0">
                            {name[0]?.toUpperCase()}
                          </div>
                          <p className="text-xs font-medium text-[#041c3a] truncate">{name}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Registrations sub-section
// ─────────────────────────────────────────────────────────────────────────────

function RegistrationsSection({ event }: { event: FullEvent }) {
  const [search, setSearch] = useState('');
  const [filterCheckedIn, setFilterCheckedIn] = useState<'all' | 'in' | 'out'>('all');

  const registrations = event.registrations ?? [];
  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const registrationPct = event.max_deelnemers
    ? Math.min(100, Math.round((event.registrations_count / event.max_deelnemers) * 100))
    : null;

  const bronBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    registrations.forEach(r => { const k = r.bron ?? 'Onbekend'; map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [registrations]);

  const faculteitBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    registrations.forEach(r => { const k = r.faculteit ?? 'Onbekend'; map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [registrations]);

  const filtered = useMemo(() => registrations.filter(r => {
    const matchSearch = !search
      || fullName(r).toLowerCase().includes(search.toLowerCase())
      || (r.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterCheckedIn === 'all'
      || (filterCheckedIn === 'in' ? r.checked_in : !r.checked_in);
    return matchSearch && matchFilter;
  }), [registrations, search, filterCheckedIn]);

  return (
    <div>
      <SectionTitle icon={<Users className="h-4 w-4" />} badge={event.registrations_count}>
        Inschrijvingen
      </SectionTitle>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ingeschreven</p>
          <p className="text-3xl font-extrabold text-[#041c3a]">
            {event.registrations_count}
            {event.max_deelnemers && <span className="text-sm font-normal text-slate-400"> / {event.max_deelnemers}</span>}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Aanwezig</p>
          <p className="text-3xl font-extrabold text-emerald-700">{checkedInCount}</p>
        </div>
        <div className={`p-4 rounded-xl text-center border ${registrationPct == null ? 'bg-slate-50 border-slate-100' : registrationPct >= 90 ? 'bg-red-50 border-red-100' : registrationPct >= 70 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${registrationPct == null ? 'text-slate-400' : registrationPct >= 90 ? 'text-red-500' : registrationPct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>Bezetting</p>
          <p className={`text-3xl font-extrabold ${registrationPct == null ? 'text-slate-300' : registrationPct >= 90 ? 'text-red-500' : registrationPct >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {registrationPct != null ? `${registrationPct}%` : '—'}
          </p>
        </div>
      </div>

      {registrationPct != null && (
        <div className="mb-3 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${registrationPct >= 90 ? 'bg-red-400' : registrationPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${registrationPct}%` }}
          />
        </div>
      )}

      {registrations.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-4 rounded-xl border border-slate-100 bg-white">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Bron</p>
              <div className="space-y-2">
                {bronBreakdown.map(([bron, count]) => (
                  <div key={bron} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-20 truncate shrink-0">{bron}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ed6425]/60 rounded-full" style={{ width: `${(count / registrations.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-white">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Faculteit</p>
              <div className="space-y-2">
                {faculteitBreakdown.map(([fac, count]) => (
                  <div key={fac} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-20 truncate shrink-0" title={fac}>{fac}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-300 rounded-full" style={{ width: `${(count / registrations.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Collapsible
            title="Deelnemerslijst"
            icon={<UserCheck className="h-3.5 w-3.5" />}
            count={filtered.length}
            defaultOpen={false}
            actions={
              <button
                onClick={() => exportRegistrationsCSV(registrations, event.titel)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#ed6425] hover:border-[#ed6425]/30 transition-colors font-semibold"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            }
          >
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                <input
                  type="text"
                  placeholder="Zoek op naam of e-mail…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-100 rounded-lg focus:outline-none focus:border-[#ed6425]/40 bg-slate-50"
                />
              </div>
              <div className="flex rounded-lg border border-slate-100 overflow-hidden text-[10px] font-bold">
                {(['all', 'in', 'out'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setFilterCheckedIn(v)}
                    className={`px-2.5 py-1.5 transition-colors ${filterCheckedIn === v ? 'bg-[#ed6425] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  >
                    {v === 'all' ? 'Alle' : v === 'in' ? '✓ Aanwezig' : '✗ Afwezig'}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0
              ? <EmptyState message="Geen deelnemers gevonden." />
              : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="text-left pb-2 pr-3 font-bold">Naam</th>
                        <th className="text-left pb-2 pr-3 font-bold">Email</th>
                        <th className="text-left pb-2 pr-3 font-bold">Faculteit</th>
                        <th className="text-left pb-2 pr-3 font-bold">Studiejaar</th>
                        <th className="text-left pb-2 pr-3 font-bold">Bron</th>
                        <th className="text-left pb-2 pr-3 font-bold">Hoe gevonden</th>
                        <th className="text-left pb-2 pr-3 font-bold">Ingeschreven op</th>
                        <th className="text-left pb-2 pr-3 font-bold">Ingediend op</th>
                        <th className="text-left pb-2 font-bold">✓</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(r => (
                        <tr key={r.id} className={`hover:bg-slate-50 align-top ${r.checked_in ? '' : 'opacity-70'}`}>
                          <td className="py-2 pr-3 font-semibold text-[#041c3a] whitespace-nowrap">{fullName(r)}</td>
                          <td className="py-2 pr-3 text-slate-500">
                            {r.email ? <a href={`mailto:${r.email}`} className="text-blue-500 hover:underline">{r.email}</a> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2 pr-3 text-slate-600">{r.faculteit ?? <span className="text-slate-300">—</span>}</td>
                          <td className="py-2 pr-3 text-slate-600">{r.studiejaar ?? <span className="text-slate-300">—</span>}</td>
                          <td className="py-2 pr-3">
                            {r.bron ? <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">{r.bron}</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2 pr-3 text-slate-500 max-w-[110px] truncate" title={r.hoe_gevonden ?? ''}>
                            {r.hoe_gevonden ?? <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2 pr-3 text-slate-400 whitespace-nowrap text-[10px]">
                            {formatDateTime(r.ingeschreven_op ?? r.registered_at)}
                          </td>
                          <td className="py-2 pr-3 text-slate-400 whitespace-nowrap text-[10px]">
                            {r.ingediend_op ? formatDateTime(r.ingediend_op) : <span className="text-slate-200">—</span>}
                          </td>
                          <td className="py-2">
                            {r.checked_in ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-200" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Collapsible>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback sub-section
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackSection({ feedback }: { feedback: Feedback[] }) {
  const avgS1 = avg(feedback.map(f => f.schaal_1));
  const avgS2 = avg(feedback.map(f => f.schaal_2));
  const avgS3 = avg(feedback.map(f => f.schaal_3));
  const overallAvg = avg([avgS1, avgS2, avgS3]);

  const distribution = [1, 2, 3, 4, 5].map(score => ({
    score,
    count: feedback.filter(f => f.schaal_1 === score).length,
  }));
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div>
      <SectionTitle icon={<MessageSquare className="h-4 w-4" />} badge={feedback.length}>
        Feedback
      </SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1">Gem. score</p>
          <p className="text-3xl font-extrabold text-[#041c3a]">{overallAvg ?? '—'}</p>
          <p className="text-[10px] text-slate-400">/ 5</p>
        </div>
        <div className="col-span-3 p-4 rounded-xl border border-slate-100 bg-white space-y-2">
          <RatingBar value={avgS1} label={RATING_LABELS.schaal_1} />
          <RatingBar value={avgS2} label={RATING_LABELS.schaal_2} />
          <RatingBar value={avgS3} label={RATING_LABELS.schaal_3} />
        </div>
      </div>

      {feedback.some(f => f.schaal_1 != null) && (
        <div className="p-4 rounded-xl border border-slate-100 bg-white mb-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Verdeling ({RATING_LABELS.schaal_1})</p>
          <div className="flex items-end gap-2 h-16">
            {distribution.map(({ score, count }) => (
              <div key={score} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">{count || ''}</span>
                <div
                  className="w-full rounded-t bg-amber-200 hover:bg-amber-400 transition-colors"
                  style={{ height: `${(count / maxCount) * 48}px`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] font-bold text-slate-500">{score}★</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Collapsible
        title="Individuele reacties"
        icon={<MessageSquare className="h-3.5 w-3.5" />}
        count={feedback.length}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {feedback.map((f, i) => (
            <div key={f.id} className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-500">Reactie {i + 1}</span>
                <div className="flex items-center gap-3">
                  {f.email && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${f.email}`} className="hover:text-blue-500 hover:underline">{f.email}</a>
                    </span>
                  )}
                  {f.created_at && <span className="text-[10px] text-slate-300">{formatDateTime(f.created_at)}</span>}
                </div>
              </div>

              {(f.schaal_1 != null || f.schaal_2 != null || f.schaal_3 != null) && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  {(['schaal_1', 'schaal_2', 'schaal_3'] as const).map(key => f[key] != null ? (
                    <div key={key}>
                      <p className="text-[10px] text-amber-600 font-bold mb-1">{RATING_LABELS[key]}</p>
                      <StarRating value={f[key]} />
                    </div>
                  ) : null)}
                </div>
              )}

              <div className="space-y-2">
                {f.favo_onderdeel && (
                  <div className="flex gap-2 items-start p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-600 font-bold text-[10px] shrink-0 mt-0.5 uppercase tracking-wide">✓ Favoriet</span>
                    <p className="text-xs text-emerald-800 leading-relaxed">{f.favo_onderdeel}</p>
                  </div>
                )}
                {f.wat_kon_beter && (
                  <div className="flex gap-2 items-start p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-amber-600 font-bold text-[10px] shrink-0 mt-0.5 uppercase tracking-wide">△ Beter</span>
                    <p className="text-xs text-amber-900 leading-relaxed">{f.wat_kon_beter}</p>
                  </div>
                )}
                {f.andere_opmerkingen && (
                  <div className="flex gap-2 items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-bold text-[10px] shrink-0 mt-0.5 uppercase tracking-wide">· Overig</span>
                    <p className="text-xs text-slate-600 italic leading-relaxed">{f.andere_opmerkingen}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface EventDetailSheetProps {
  event: FullEvent | null;
  onClose: () => void;
}

export function EventDetailSheet({ event, onClose }: EventDetailSheetProps) {
  if (!event) return null;

  const status = STATUS_STYLES[event.status] ?? {
    bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400',
    border: 'border-slate-200', label: event.status,
  };

  const feedback = event.feedback ?? [];

  const speakers = [...(event.speakers ?? event.event_sprekers ?? [])]
    .sort((a, b) => (a.volgorde ?? 99) - (b.volgorde ?? 99));

  const rollen: EventRol[] = event.event_rollen ?? [];

  const financieel = event.financieel_resultaat;

  return (
    <Sheet open={!!event} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        className="w-full sm:max-w-3xl overflow-y-auto border-l border-slate-100 p-0 bg-white"
        style={{ maxWidth: '56rem' }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ed6425] via-[#c94d15] to-[#041c3a]" />

        <div className="px-7 py-6 space-y-8">

          {/* ── HEADER ── */}
          <SheetHeader className="pb-5 border-b border-slate-100 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <SheetTitle className="text-2xl font-extrabold text-[#041c3a] leading-tight tracking-tight">
                {event.titel}
              </SheetTitle>
              {event.is_published && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                  <Globe className="h-3 w-3" /> Gepubliceerd
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Pill color="orange">{TYPE_LABELS[event.type] ?? event.type}</Pill>
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {event.academic_year && <Pill color="slate">{event.academic_year.naam}</Pill>}
              {event.domains?.map(d => <Pill key={d.id} color="indigo">{d.naam}</Pill>)}
            </div>
          </SheetHeader>

          {/* ── DATUM & LOCATIE ── */}
          <div>
            <SectionTitle icon={<Calendar className="h-4 w-4" />}>Datum & Locatie</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <MetaField label="Datum" value={formatDate(event.event_datum)} />
              <MetaField
                label="Locatie"
                value={event.locatie
                  ? <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#ed6425] shrink-0" />{event.locatie}</span>
                  : null}
              />
              <MetaField
                label="Tijdstip"
                value={event.start_tijd
                  ? <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#ed6425] shrink-0" />{formatTime(event.start_tijd)} – {formatTime(event.einde_tijd)}</span>
                  : null}
              />
              {event.deuren_open && (
                <MetaField
                  label="Deuren open"
                  value={<span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#ed6425] shrink-0" />{formatTime(event.deuren_open)}</span>}
                />
              )}
              <MetaField label="Max. deelnemers" value={event.max_deelnemers ?? '—'} />
            </div>
          </div>

          {/* ── ACADEMIEJAAR ── */}
          {event.academic_year && (
            <div>
              <SectionTitle icon={<BookOpen className="h-4 w-4" />}>Academiejaar</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <MetaField label="Naam" value={event.academic_year.naam} />
                {event.academic_year.start_datum && <MetaField label="Start" value={formatDateShort(event.academic_year.start_datum)} />}
                {event.academic_year.eind_datum && <MetaField label="Einde" value={formatDateShort(event.academic_year.eind_datum)} />}
                <MetaField
                  label="Huidig"
                  value={event.academic_year.is_huidig != null
                    ? (event.academic_year.is_huidig
                      ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Ja</span>
                      : <span className="flex items-center gap-1 text-slate-400"><XCircle className="h-3.5 w-3.5" /> Nee</span>)
                    : null}
                />
              </div>
            </div>
          )}

          {/* ── DOMEINEN ── */}
          {!!event.domains?.length && (
            <div>
              <SectionTitle icon={<Layers className="h-4 w-4" />} badge={event.domains.length}>Domeinen</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {event.domains.map(d => (
                  <div key={d.id} className="px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50">
                    <p className="text-xs font-bold text-indigo-700">{d.naam}</p>
                    {d.created_at && <p className="text-[10px] text-indigo-300 mt-0.5">Aangemaakt {formatDateShort(d.created_at)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BESCHRIJVINGEN ── */}
          {(event.beschrijving_website || event.beschrijving_sociaal) && (
            <div>
              <SectionTitle icon={<FileText className="h-4 w-4" />}>Beschrijvingen</SectionTitle>
              <div className="space-y-3">
                {event.beschrijving_website && (
                  <div className="p-4 rounded-xl border border-slate-100 bg-white">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      <Globe className="h-3.5 w-3.5 text-[#ed6425]" /> Website
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{event.beschrijving_website}</p>
                  </div>
                )}
                {event.beschrijving_sociaal && (
                  <div className="p-4 rounded-xl border border-slate-100 bg-white">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      <Share2 className="h-3.5 w-3.5 text-[#ed6425]" /> Sociaal
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{event.beschrijving_sociaal}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FINANCIEEL RESULTAAT ── */}
          {financieel != null && <FinancieelSection value={financieel} />}

          {/* ── INSCHRIJVINGEN ── */}
          <RegistrationsSection event={event} />

          {/* ── ROLLEN ── */}
          {rollen.length > 0 && <CrewSection rollen={rollen} />}

          {/* ── SPREKERS ── */}
          <div>
            <SectionTitle icon={<Mic className="h-4 w-4" />} badge={speakers.length}>Sprekers</SectionTitle>
            {speakers.length === 0
              ? <EmptyState message="Geen sprekers gekoppeld aan dit event." />
              : (
                <div className="space-y-3">
                  {speakers.map((s, idx) => (
                    <div key={s.id} className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-[#ed6425]/10 flex items-center justify-center shrink-0 text-xs font-extrabold text-[#ed6425]">
                            {s.volgorde ?? idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#041c3a]">{s.naam}</p>
                            {s.volgorde != null && <p className="text-[10px] text-slate-400">Volgorde #{s.volgorde}</p>}
                          </div>
                        </div>
                        <Pill color="orange">{ROL_LABELS[s.rol] ?? s.rol}</Pill>
                      </div>

                      {s.omschrijving && (
                        <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-[#ed6425]/30 pl-3">
                          {s.omschrijving}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 pt-1">
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <a href={`mailto:${s.email}`} className="text-blue-500 hover:underline">{s.email}</a>
                          </div>
                        )}
                        {s.telefoon && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <a href={`tel:${s.telefoon}`} className="hover:text-blue-500">{s.telefoon}</a>
                          </div>
                        )}
                      </div>

                      {s.created_at && (
                        <p className="text-[10px] text-slate-300">Toegevoegd op {formatDateTime(s.created_at)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* ── FEEDBACK ── */}
          {feedback.length > 0 && <FeedbackSection feedback={feedback} />}

          {/* ── META ── */}
          <div className="pt-1 border-t border-slate-100">
            <SectionTitle icon={<Info className="h-4 w-4" />}>Meta</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <MetaField label="Aangemaakt op" value={<span className="text-xs text-slate-600">{formatDateTime(event.created_at)}</span>} />
              {event.updated_at && <MetaField label="Laatste wijziging" value={<span className="text-xs text-slate-600">{formatDateTime(event.updated_at)}</span>} />}
              <MetaField label="Event ID" value={event.id} mono />
              {event.created_by && <MetaField label="Aangemaakt door" value={event.created_by} mono />}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}