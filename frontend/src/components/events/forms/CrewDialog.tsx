import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
  Mail,
  Send,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Event } from '../../../types/event';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrewRol {
  id: string;
  naam: string;
  beschrijving: string | null;
}

interface CrewMember {
  id: string;
  user_id: string;
  rol_id: string;
  notities: string | null;
  bevestigd: boolean;
  created_at: string;
  rol?: CrewRol;
  user_email?: string;
  user_naam?: string;
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400 text-sm';
const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-slate-400';

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type AdminTab = 'overzicht' | 'rollen' ;

function TabBar({
  active,
  onChange,
  counts,
}: {
  active: AdminTab;
  onChange: (t: AdminTab) => void;
  counts: { overzicht: number; rollen: number };
}) {
  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overzicht', label: 'Crew', count: counts.overzicht },
    { id: 'rollen', label: 'Rollen', count: counts.rollen },
  ];
  return (
    <div className="flex border-b border-slate-200 bg-slate-50/60">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            active === tab.id
              ? 'border-[#041c3a] text-[#041c3a]'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
          }`}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                active === tab.id
                  ? 'bg-[#041c3a] text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Admin: Crew overzicht tab ────────────────────────────────────────────────

function OverzichtTab({
  rollen,
  crew,
  onToggleBevestigd,
  onRemove,
}: {
  rollen: CrewRol[];
  crew: CrewMember[];
  onToggleBevestigd: (id: string, current: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const crewByRol = rollen.map((rol) => ({
    rol,
    members: crew.filter((c) => c.rol_id === rol.id),
  }));

  const unassigned = crew.filter((c) => !rollen.find((r) => r.id === c.rol_id));

  const bevestigdCount = crew.filter((c) => c.bevestigd).length;

  if (crew.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Users className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Nog geen crew ingeschreven</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl bg-[#041c3a]/5 border border-[#041c3a]/10 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-[#041c3a]">{crew.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Totaal</p>
        </div>
        <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{bevestigdCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">Bevestigd</p>
        </div>
        <div className="flex-1 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{crew.length - bevestigdCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mt-0.5">In afwachting</p>
        </div>
      </div>

      {/* Crew grouped by rol */}
      {crewByRol.map(({ rol, members }) =>
        members.length === 0 ? null : (
          <div key={rol.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {rol.naam}
              </p>
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-400">{members.length}</span>
            </div>
            <div className="space-y-1.5">
              {members.map((m) => (
                <CrewMemberRow
                  key={m.id}
                  member={m}
                  onToggle={() => onToggleBevestigd(m.id, m.bevestigd)}
                  onRemove={() => onRemove(m.id)}
                />
              ))}
            </div>
          </div>
        )
      )}

      {unassigned.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Zonder rol
            </p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          {unassigned.map((m) => (
            <CrewMemberRow
              key={m.id}
              member={m}
              onToggle={() => onToggleBevestigd(m.id, m.bevestigd)}
              onRemove={() => onRemove(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CrewMemberRow({
  member,
  onToggle,
  onRemove,
}: {
  member: CrewMember;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const name = member.user_naam ?? member.user_email?.split('@')[0] ?? 'Gebruiker';
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-slate-300 transition-colors group">
      <Avatar name={name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#041c3a] truncate">{name}</p>
        {member.user_email && member.user_naam && (
          <p className="text-[11px] text-slate-400 truncate">{member.user_email}</p>
        )}
        {member.notities && (
          <p className="text-[11px] text-slate-400 italic truncate mt-0.5">{member.notities}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
            member.bevestigd
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          }`}
          title={member.bevestigd ? 'Klik om te weigeren' : 'Klik om te bevestigen'}
        >
          {member.bevestigd ? (
            <>
              <UserCheck className="w-3 h-3" />
              Bevestigd
            </>
          ) : (
            <>
              <UserX className="w-3 h-3" />
              Afwachting
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Admin: Rollen tab ────────────────────────────────────────────────────────

function RollenTab({
  rollen,
  crew,
  onAdd,
  onEdit,
  onDelete,
}: {
  rollen: CrewRol[];
  crew: CrewMember[];
  onAdd: () => void;
  onEdit: (r: CrewRol) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {rollen.length === 0
            ? 'Maak rollen aan zodat crew zich kan inschrijven.'
            : `${rollen.length} rol${rollen.length !== 1 ? 'len' : ''} aangemaakt`}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={onAdd}
          className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Nieuwe rol
        </Button>
      </div>

      {rollen.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
          <Shield className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">Nog geen rollen</p>
          <p className="text-xs text-slate-300 mt-1">
            Klik op "Nieuwe rol" om te starten
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rollen.map((rol) => {
            const memberCount = crew.filter((c) => c.rol_id === rol.id).length;
            return (
              <div
                key={rol.id}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#041c3a]/8 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#041c3a]/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#041c3a]">{rol.naam}</p>
                  {rol.beschrijving && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{rol.beschrijving}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-medium">
                    {memberCount} {memberCount === 1 ? 'persoon' : 'personen'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit(rol)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#041c3a] hover:bg-[#041c3a]/8 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(rol.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      disabled={memberCount > 0}
                      title={memberCount > 0 ? 'Verwijder eerst alle crew met deze rol' : 'Verwijderen'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── Rol form (inline in rollen tab) ─────────────────────────────────────────

function RolForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: CrewRol;
  onSave: (naam: string, beschrijving: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [naam, setNaam] = useState(initial?.naam ?? '');
  const [beschrijving, setBeschrijving] = useState(initial?.beschrijving ?? '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSave() {
    if (!naam) return;
    setSaving(true);
    await onSave(naam, beschrijving);
    setSaving(false);
  }

  return (
    <div className="rounded-xl border-2 border-[#041c3a]/20 bg-[#041c3a]/3 p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
        {initial ? 'Rol bewerken' : 'Nieuwe rol'}
      </p>
      <div className="space-y-1.5">
        <Label className={labelClass}>Naam *</Label>
        <Input
          ref={inputRef}
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="bv. Onthaal, Techniek, Fotografie..."
          className={inputClass}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </div>
      <div className="space-y-1.5">
        <Label className={labelClass}>Beschrijving</Label>
        <Input
          value={beschrijving}
          onChange={(e) => setBeschrijving(e.target.value)}
          placeholder="Korte omschrijving van de rol..."
          className={inputClass}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !naam}
          size="sm"
          className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          <span className="ml-1">{saving ? 'Opslaan...' : 'Opslaan'}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="border-slate-200 text-slate-500 text-xs h-8"
        >
          Annuleren
        </Button>
      </div>
    </div>
  );
}

// ─── User signup view ─────────────────────────────────────────────────────────

function UserSignupView({
  eventId,
  userId,
  rollen,
}: {
  eventId: string;
  userId: string;
  rollen: CrewRol[];
}) {
  const [myEntry, setMyEntry] = useState<{
    id: string;
    rol_id: string;
    notities: string | null;
    bevestigd: boolean;
  } | null>(null);
  const [rolId, setRolId] = useState('');
  const [notities, setNotities] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('event_crew')
      .select('id, rol_id, notities, bevestigd')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMyEntry(data);
          setRolId(data.rol_id);
          setNotities(data.notities ?? '');
        }
        setLoading(false);
      });
  }, [eventId, userId]);

  async function handleSignup() {
    if (!rolId) return;
    setSaving(true);
    if (myEntry) {
      await supabase
        .from('event_crew')
        .update({ rol_id: rolId, notities: notities || null })
        .eq('id', myEntry.id);
      setMyEntry((prev) => prev && { ...prev, rol_id: rolId, notities: notities || null });
    } else {
      const { data } = await supabase
        .from('event_crew')
        .insert({ event_id: eventId, user_id: userId, rol_id: rolId, notities: notities || null })
        .select()
        .single();
      if (data) setMyEntry(data);
    }
    setSaving(false);
  }

  async function handleWithdraw() {
    if (!myEntry) return;
    await supabase.from('event_crew').delete().eq('id', myEntry.id);
    setMyEntry(null);
    setRolId('');
    setNotities('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  if (rollen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Nog geen rollen beschikbaar</p>
          <p className="text-xs text-slate-400 mt-0.5">
            De organisator moet eerst rollen aanmaken
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status badge if already signed up */}
      {myEntry && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            myEntry.bevestigd
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          {myEntry.bevestigd ? (
            <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Loader2 className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <div>
            <p
              className={`text-sm font-bold ${
                myEntry.bevestigd ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {myEntry.bevestigd ? 'Inschrijving bevestigd' : 'In afwachting van bevestiging'}
            </p>
            <p className={`text-xs mt-0.5 ${myEntry.bevestigd ? 'text-emerald-500' : 'text-amber-500'}`}>
              {myEntry.bevestigd
                ? 'De organisator heeft jouw deelname goedgekeurd'
                : 'Je inschrijving is ontvangen en wordt nagekeken'}
            </p>
          </div>
        </div>
      )}

      {/* Rol selector */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className={labelClass}>Kies jouw rol *</Label>
          <div className="grid gap-2">
            {rollen.map((rol) => (
              <button
                key={rol.id}
                type="button"
                onClick={() => setRolId(rol.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  rolId === rol.id
                    ? 'border-[#041c3a] bg-[#041c3a]/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    rolId === rol.id ? 'border-[#041c3a] bg-[#041c3a]' : 'border-slate-300'
                  }`}
                >
                  {rolId === rol.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#041c3a]">{rol.naam}</p>
                  {rol.beschrijving && (
                    <p className="text-xs text-slate-400 mt-0.5">{rol.beschrijving}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Notities (optioneel)</Label>
          <Input
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            placeholder="Beschikbaarheid, opmerkingen..."
            className={inputClass}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            onClick={handleSignup}
            disabled={saving || !rolId}
            className="flex-1 bg-[#041c3a] hover:bg-[#041c3a]/90 text-white gap-2 font-semibold"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {myEntry ? 'Aanpassen' : 'Inschrijven als crew'}
          </Button>
          {myEntry && (
            <Button
              type="button"
              variant="outline"
              onClick={handleWithdraw}
              className="border-red-200 text-red-500 hover:bg-red-50 px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main CrewDialog ──────────────────────────────────────────────────────────

interface CrewDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrewDialog({ event, open, onOpenChange }: CrewDialogProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [rollen, setRollen] = useState<CrewRol[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overzicht');

  // Rol form state
  const [rolFormOpen, setRolFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<CrewRol | null>(null);

  const isAdmin = !!userId && !!event.created_by && userId === event.created_by;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (open) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.id]);

  async function fetchAll() {
    setLoading(true);
    const [{ data: rolData }, { data: crewData }] = await Promise.all([
      supabase.from('crew_rollen').select('*').order('naam'),
      supabase
        .from('event_crew')
        .select(`
          id, user_id, rol_id, notities, bevestigd, created_at,
          rol:crew_rollen(id, naam, beschrijving)
        `)
        .eq('event_id', event.id),
    ]);

    if (rolData) setRollen(rolData);

    if (crewData && crewData.length > 0) {
      const userIds = crewData.map((c: any) => c.user_id);
      const { data: usersInfo } = await supabase.rpc('get_users_info', { user_ids: userIds });
      const userMap = new Map((usersInfo ?? []).map((u: any) => [u.id, u]));
      setCrew(
        crewData.map((c: any) => {
          const u = userMap.get(c.user_id) as any;
          return { ...c, user_email: u?.email ?? c.user_id, user_naam: u?.full_name ?? null };
        })
      );
    } else {
      setCrew([]);
    }
    setLoading(false);
  }

  async function handleToggleBevestigd(crewId: string, current: boolean) {
    await supabase.from('event_crew').update({ bevestigd: !current }).eq('id', crewId);
    setCrew((prev) => prev.map((c) => (c.id === crewId ? { ...c, bevestigd: !current } : c)));
  }

  async function handleRemoveMember(crewId: string) {
    await supabase.from('event_crew').delete().eq('id', crewId);
    setCrew((prev) => prev.filter((c) => c.id !== crewId));
  }

  async function handleSaveRol(naam: string, beschrijving: string) {
    const payload = { naam, beschrijving: beschrijving || null };
    if (editingRol) {
      await supabase.from('crew_rollen').update(payload).eq('id', editingRol.id);
    } else {
      await supabase.from('crew_rollen').insert(payload);
    }
    setRolFormOpen(false);
    setEditingRol(null);
    fetchAll();
  }

  async function handleDeleteRol(id: string) {
    await supabase.from('crew_rollen').delete().eq('id', id);
    setRollen((prev) => prev.filter((r) => r.id !== id));
  }

  function openNewRol() {
    setEditingRol(null);
    setRolFormOpen(true);
  }

  function openEditRol(rol: CrewRol) {
    setEditingRol(rol);
    setRolFormOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#041c3a] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-[#041c3a] leading-tight">
                Crew
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{event.titel}</p>
            </div>
            {isAdmin && (
              <Badge className="text-[10px] bg-[#ed6425]/15 text-[#ed6425] border-[#ed6425]/20 border shrink-0">
                <Shield className="w-2.5 h-2.5 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Tab bar (admin only) */}
        {isAdmin && (
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            counts={{ overzicht: crew.length, rollen: rollen.length }}
          />
        )}

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
            </div>
          ) : isAdmin ? (
            <>
              {activeTab === 'overzicht' && (
                <OverzichtTab
                  rollen={rollen}
                  crew={crew}
                  onToggleBevestigd={handleToggleBevestigd}
                  onRemove={handleRemoveMember}
                />
              )}

              {activeTab === 'rollen' && (
                <div className="space-y-3">
                  {rolFormOpen && (
                    <RolForm
                      initial={editingRol ?? undefined}
                      onSave={handleSaveRol}
                      onCancel={() => {
                        setRolFormOpen(false);
                        setEditingRol(null);
                      }}
                    />
                  )}
                  <RollenTab
                    rollen={rollen}
                    crew={crew}
                    onAdd={openNewRol}
                    onEdit={openEditRol}
                    onDelete={handleDeleteRol}
                  />
                </div>
              )}

            </>
          ) : (
            userId && (
              <UserSignupView eventId={event.id} userId={userId} rollen={rollen} />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}