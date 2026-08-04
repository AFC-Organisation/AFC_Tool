import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Plus, Trash2, Check, X, Pencil } from 'lucide-react';

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
  // joined
  rol?: CrewRol;
  user_email?: string;
  user_naam?: string;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

// ─── Crew Rollen beheer (admin) ───────────────────────────────────────────────

interface CrewRollenBeheerProps {
  eventId: string;
  isAdmin: boolean;
}

export function CrewRollenBeheer({ eventId, isAdmin }: CrewRollenBeheerProps) {
  const [rollen, setRollen] = useState<CrewRol[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolDialogOpen, setRolDialogOpen] = useState(false);
  const [editRol, setEditRol] = useState<CrewRol | null>(null);
  const [rolForm, setRolForm] = useState({ naam: '', beschrijving: '' });
  const [savingRol, setSavingRol] = useState(false);

  useEffect(() => {
    if (eventId) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

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
        .eq('event_id', eventId),
    ]);

    if (rolData) setRollen(rolData);
    if (crewData) {
      // Fetch user info per crew member
      const withUsers = await Promise.all(
        crewData.map(async (c: any) => {
          const { data: userData } = await supabase
            .from('profiles') // adjust to your profiles table if you have one
            .select('email, naam')
            .eq('id', c.user_id)
            .single();
          return {
            ...c,
            user_email: userData?.email ?? c.user_id,
            user_naam: userData?.naam ?? null,
          };
        })
      );
      setCrew(withUsers);
    }
    setLoading(false);
  }

  function openAddRol() {
    setEditRol(null);
    setRolForm({ naam: '', beschrijving: '' });
    setRolDialogOpen(true);
  }

  function openEditRol(rol: CrewRol) {
    setEditRol(rol);
    setRolForm({ naam: rol.naam, beschrijving: rol.beschrijving ?? '' });
    setRolDialogOpen(true);
  }

  async function saveRol() {
    const trimmedNaam = rolForm.naam.trim();
    if (!trimmedNaam) return;
    const duplicate = rollen.some(
      (r) => r.naam.toLowerCase() === trimmedNaam.toLowerCase() && r.id !== editRol?.id
    );
    if (duplicate) {
      alert('Er bestaat al een rol met deze naam.');
      return;
    }
    setSavingRol(true);
    const payload = { naam: trimmedNaam, beschrijving: rolForm.beschrijving.trim() || null };
    if (editRol) {
      await supabase.from('crew_rollen').update(payload).eq('id', editRol.id);
    } else {
      await supabase.from('crew_rollen').insert(payload);
    }
    setSavingRol(false);
    setRolDialogOpen(false);
    fetchAll();
  }

  async function deleteRol(id: string) {
    await supabase.from('crew_rollen').delete().eq('id', id);
    fetchAll();
  }

  async function toggleBevestigd(crewId: string, current: boolean) {
    await supabase.from('event_crew').update({ bevestigd: !current }).eq('id', crewId);
    setCrew((prev) =>
      prev.map((c) => (c.id === crewId ? { ...c, bevestigd: !current } : c))
    );
  }

  async function removeCrewMember(crewId: string) {
    await supabase.from('event_crew').delete().eq('id', crewId);
    setCrew((prev) => prev.filter((c) => c.id !== crewId));
  }

  // Group crew by rol
  const crewByRol = rollen.map((rol) => ({
    rol,
    members: crew.filter((c) => c.rol_id === rol.id),
  }));

  if (loading) {
    return <p className="text-xs text-slate-400 text-center py-6">Laden...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Rollen beheer (admin only) */}
      {isAdmin && (
        <div className="rounded-lg border border-dashed border-slate-300 p-3 space-y-2 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Beschikbare rollen
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openAddRol}
              className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              Rol toevoegen
            </Button>
          </div>

          {rollen.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">
              Nog geen rollen aangemaakt voor dit event
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {rollen.map((rol) => (
              <div
                key={rol.id}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#041c3a] group"
              >
                <span>{rol.naam}</span>
                <span className="text-slate-400 text-[10px]">
                  ({crew.filter((c) => c.rol_id === rol.id).length} personen)
                </span>
                <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditRol(rol)}
                    className="text-slate-400 hover:text-[#041c3a] p-0.5"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRol(rol.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crew list grouped by rol */}
      {crewByRol.map(({ rol, members }) => (
        <div key={rol.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
              {rol.naam}
            </p>
            <Badge className="text-[10px] bg-[#041c3a]/10 text-[#041c3a] border-0 px-1.5 py-0">
              {members.length}
            </Badge>
          </div>

          {members.length === 0 && (
            <p className="text-xs text-slate-400 italic ml-1">Nog niemand ingeschreven</p>
          )}

          <div className="space-y-1.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <div className="w-7 h-7 rounded-full bg-[#041c3a]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#041c3a]">
                  {(member.user_naam ?? member.user_email ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#041c3a] truncate">
                    {member.user_naam ?? member.user_email}
                  </p>
                  {member.notities && (
                    <p className="text-xs text-slate-400 truncate">{member.notities}</p>
                  )}
                </div>
                <Badge
                  className={`text-[10px] border px-1.5 py-0 shrink-0 ${
                    member.bevestigd
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}
                >
                  {member.bevestigd ? 'Bevestigd' : 'In afwachting'}
                </Badge>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleBevestigd(member.id, member.bevestigd)}
                      className={`p-1.5 rounded transition-colors ${
                        member.bevestigd
                          ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={member.bevestigd ? 'Ongedaan maken' : 'Bevestigen'}
                    >
                      {member.bevestigd ? (
                        <X className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCrewMember(member.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Rol dialog */}
      <Dialog open={rolDialogOpen} onOpenChange={setRolDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#041c3a] font-bold">
              {editRol ? 'Rol bewerken' : 'Nieuwe rol aanmaken'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className={labelClass}>Naam *</Label>
              <Input
                value={rolForm.naam}
                onChange={(e) => setRolForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder="bv. Onthaal, Techniek, Fotografie..."
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Beschrijving</Label>
              <Textarea
                value={rolForm.beschrijving}
                onChange={(e) => setRolForm((f) => ({ ...f, beschrijving: e.target.value }))}
                placeholder="Wat doet deze rol tijdens het event?"
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolDialogOpen(false)} className="border-slate-200">
              Annuleren
            </Button>
            <Button
              onClick={saveRol}
              disabled={savingRol || !rolForm.naam}
              className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white"
            >
              {savingRol ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── User signup widget (for non-admins) ─────────────────────────────────────

interface CrewSignupProps {
  eventId: string;
  userId: string;
}

export function CrewSignup({ eventId, userId }: CrewSignupProps) {
  const [rollen, setRollen] = useState<CrewRol[]>([]);
  const [myEntry, setMyEntry] = useState<CrewMember | null>(null);
  const [rolId, setRolId] = useState('');
  const [notities, setNotities] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, userId]);

  async function fetchData() {
    setLoading(true);
    const [{ data: rolData }, { data: myData }] = await Promise.all([
      supabase.from('crew_rollen').select('*').order('naam'),
      supabase
        .from('event_crew')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    if (rolData) setRollen(rolData);
    if (myData) {
      setMyEntry(myData);
      setRolId(myData.rol_id);
      setNotities(myData.notities ?? '');
    }
    setLoading(false);
  }

  async function handleSignup() {
    if (!rolId) return;
    setSaving(true);
    if (myEntry) {
      await supabase
        .from('event_crew')
        .update({ rol_id: rolId, notities: notities || null })
        .eq('id', myEntry.id);
    } else {
      await supabase.from('event_crew').insert({
        event_id: eventId,
        user_id: userId,
        rol_id: rolId,
        notities: notities || null,
      });
    }
    setSaving(false);
    fetchData();
  }

  async function handleWithdraw() {
    if (!myEntry) return;
    await supabase.from('event_crew').delete().eq('id', myEntry.id);
    setMyEntry(null);
    setRolId('');
    setNotities('');
  }

  if (loading) return null;

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#041c3a]/5 border-b border-slate-200">
        <Users className="w-3.5 h-3.5 text-[#ed6425]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
          Meegaan als crew
        </p>
        {myEntry && (
          <Badge className={`ml-auto text-[10px] border px-1.5 py-0 ${
            myEntry.bevestigd
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
            {myEntry.bevestigd ? '✓ Bevestigd' : 'In afwachting van bevestiging'}
          </Badge>
        )}
      </div>
      <div className="p-4 bg-white space-y-3">
        {rollen.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3">
            De organisator heeft nog geen rollen aangemaakt voor dit event.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Jouw rol *</Label>
                <Select value={rolId} onValueChange={setRolId}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Kies een rol..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rollen.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.naam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Notities</Label>
                <Input
                  value={notities}
                  onChange={(e) => setNotities(e.target.value)}
                  placeholder="Opmerkingen..."
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSignup}
                disabled={saving || !rolId}
                className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8 gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                {myEntry ? 'Aanpassen' : 'Inschrijven als crew'}
              </Button>
              {myEntry && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWithdraw}
                  className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-8"
                >
                  Uitschrijven
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}