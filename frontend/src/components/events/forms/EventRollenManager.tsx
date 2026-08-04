import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Clock, Users as UsersIcon, X, Loader2, Shield, CalendarClock } from 'lucide-react';
import { RolFormDialog } from './RolFormDialog';
import { useEventRollen, useEventRolMutations } from '../../../hooks/useEventRollen';
import type { EventRol, EventStatus, EventRolFormData } from '../../../types/event';

const HOUR_WIDTH = 130; // px per uur in de tijdlijn (horizontaal, links -> rechts)
const DEFAULT_START = 17 * 60; // 08:00
const DEFAULT_END = 24 * 60; // 18:00
const MIN_SPAN = 4 * 60; // toon minstens 4 uur, ook als er weinig data is
const MIN_CARD_WIDTH = 150; // genoeg ruimte voor naam + tijd + aanwezigen
const ROW_HEIGHT = 102; // hoogte van een rij in de tijdlijn
const ROW_GAP = 10; // ruimte tussen rijen
const EDGE_PADDING = 20;
/**
 * Verwacht dat `rol.uren` een tijd of tijdsrange bevat, bv. "09:00 - 12:00" of "14:00".
 * Rollen waarvan de tekst geen tijdstip bevat, belanden in "Niet ingepland".
 */
function timeToMinutes(t?: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function initialsFor(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function nameFor(t: { user_naam?: string | null; user_email?: string | null }) {
  return t.user_naam ?? t.user_email?.split('@')[0] ?? 'Gebruiker';
}

function getAssigned(rol: EventRol) {
  return (rol.toegewezen ?? []).map((t) => ({ user_id: t.user_id, name: nameFor(t) }));
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-7 h-7 text-[10px]';
  return (
    <div
      className={`${sizeClasses} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2 border-white ring-1 ring-slate-100`}
      title={name}
    >
      {initialsFor(name)}
    </div>
  );
}

/** Toont een stapel avatars zodat je in één oogopslag ziet wie er is ingeschreven. */
function AvatarStack({
  people,
  max = 3,
  size = 'sm',
}: {
  people: { user_id: string; name: string }[];
  max?: number;
  size?: 'sm' | 'md';
}) {
  if (people.length === 0) return null;
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p) => (
        <Avatar key={p.user_id} name={p.name} size={size} />
      ))}
      {extra > 0 && (
        <div
          className={`${
            size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-7 h-7 text-[10px]'
          } rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center border-2 border-white`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

interface EventRollenManagerProps {
  eventId: string;
  eventStatus: EventStatus;
  isAdmin: boolean;
  currentUserId: string | null;
}

interface PositionedRol {
  rol: EventRol;
  start: number;
  end: number;
  row: number;
  rowCount: number;
}

export function EventRollenManager({ eventId, eventStatus, isAdmin, currentUserId }: EventRollenManagerProps) {
  const { rollen, loading, refetch } = useEventRollen(eventId);
  const { createRol, updateRol, deleteRol, assignSelf, unassign } = useEventRolMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<EventRol | null>(null);
  const [busyRolId, setBusyRolId] = useState<string | null>(null);
  const [selectedRolId, setSelectedRolId] = useState<string | null>(null);

  // Roles can only be created/edited/deleted while the event is still in concept.
  const canManageRollen = isAdmin && eventStatus === 'concept';
  // Self sign-up is open during concept and voorbereid.
  const canSignup = eventStatus === 'concept' || eventStatus === 'voorbereid';

  const { scheduled, unscheduled, dayStart, hours, halfHours, gridWidth, rowCount, stats } = useMemo(() => {
    const scheduledRaw: { rol: EventRol; start: number; end: number }[] = [];
    const unscheduledRaw: EventRol[] = [];

    let totalPlaatsen = 0;
    let totalBezet = 0;

    for (const rol of rollen) {
      if (!rol.is_default) {
        totalPlaatsen += rol.plaatsen;
        totalBezet += rol.toegewezen?.length ?? 0;
      }
      const start = timeToMinutes(rol.start_uur);
      const end = timeToMinutes(rol.eind_uur);
      if (start !== null && end !== null) {
        scheduledRaw.push({ rol, start, end: end > start ? end : start + 60 });
      } else {
        unscheduledRaw.push(rol);
      }
    }

    let minStart = Math.min(DEFAULT_START, ...scheduledRaw.map((r) => r.start));
    let maxEnd = Math.max(DEFAULT_END, ...scheduledRaw.map((r) => r.end));
    minStart = Math.floor(minStart / 60) * 60;
    maxEnd = Math.ceil(maxEnd / 60) * 60;
    if (maxEnd - minStart < MIN_SPAN) maxEnd = minStart + MIN_SPAN;

    // Overlappende rollen krijgen elk een eigen rij, zoals in een horizontale agendaweergave.
    const sorted = [...scheduledRaw].sort((a, b) => a.start - b.start || a.end - b.end);
    const rowsEnd: number[] = [];
    const placed: PositionedRol[] = [];
    for (const item of sorted) {
      let row = rowsEnd.findIndex((end) => end <= item.start);
      if (row === -1) {
        row = rowsEnd.length;
        rowsEnd.push(item.end);
      } else {
        rowsEnd[row] = item.end;
      }
      placed.push({ ...item, row, rowCount: 1 });
    }
    placed.forEach((p) => {
      p.rowCount = rowsEnd.length;
    });

    const hoursArr: number[] = [];
    for (let t = minStart; t <= maxEnd; t += 60) hoursArr.push(t);
    const halfHoursArr: number[] = [];
    for (let t = minStart + 30; t < maxEnd; t += 60) halfHoursArr.push(t);

    return {
      scheduled: placed,
      unscheduled: unscheduledRaw,
      dayStart: minStart,
      hours: hoursArr,
      halfHours: halfHoursArr,
      gridWidth: ((maxEnd - minStart) / 60) * HOUR_WIDTH + EDGE_PADDING * 2,
      rowCount: Math.max(1, rowsEnd.length),
      stats: { totalPlaatsen, totalBezet, open: Math.max(0, totalPlaatsen - totalBezet) },
    };
  }, [rollen]);

  function openAdd() {
    setEditingRol(null);
    setFormOpen(true);
  }
  function openEdit(rol: EventRol) {
    setEditingRol(rol);
    setFormOpen(true);
  }

  async function handleSave(data: EventRolFormData) {
    if (editingRol) await updateRol(editingRol.id, data);
    else await createRol(eventId, data);
    setFormOpen(false);
    setEditingRol(null);
    refetch();
  }

  async function handleDelete(rolId: string) {
    setBusyRolId(rolId);
    await deleteRol(rolId);
    await refetch();
    setBusyRolId(null);
    if (selectedRolId === rolId) setSelectedRolId(null);
  }

  async function handleToggleSelf(rol: EventRol) {
    if (!currentUserId) return;
    setBusyRolId(rol.id);
    const alreadyIn = rol.toegewezen?.some((t) => t.user_id === currentUserId);
    if (alreadyIn) await unassign(rol.id, currentUserId);
    else await assignSelf(rol.id, currentUserId);
    await refetch();
    setBusyRolId(null);
  }

  async function handleRemoveUser(rol: EventRol, userId: string) {
    setBusyRolId(rol.id);
    await unassign(rol.id, userId);
    await refetch();
    setBusyRolId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  const selectedRol = rollen.find((r) => r.id === selectedRolId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
          {rollen.length} rol{rollen.length !== 1 ? 'len' : ''}
        </p>
        {(
          <Button
            type="button"
            size="sm"
            onClick={openAdd}
            className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nieuwe rol
          </Button>
        )}
      </div>

      {rollen.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          Nog geen rollen aangemaakt.
        </p>
      ) : (
        <>
          {/* Overzichtsbalk: in één oogopslag zien hoeveel plekken bezet/open zijn */}
          {stats.totalPlaatsen > 0 && (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-bold text-[#041c3a]">{stats.totalBezet}</span>
                <span className="text-xs text-slate-400">/ {stats.totalPlaatsen} ingevuld</span>
              </div>
              <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.min(100, (stats.totalBezet / stats.totalPlaatsen) * 100)}%` }}
                />
              </div>
              <span
                className={`text-xs font-bold shrink-0 ${
                  stats.open === 0 ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                {stats.open === 0 ? 'Volzet' : `${stats.open} plek${stats.open !== 1 ? 'ken' : ''} vrij`}
              </span>
            </div>
          )}

          {/* Tijdlijn / rooster: horizontaal, van links (vroeg) naar rechts (laat) */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <div style={{ width: Math.max(gridWidth, 320) }}>
              {/* Uren-as bovenaan */}
              <div className="relative h-7 border-b border-slate-200 bg-slate-50/40">
                {hours.map((h, i) => {
                  const isFirst = i === 0;
                  const isLast = i === hours.length - 1;
                  return (
                    <div
                      key={h}
                      className={`absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 ${
                        isFirst ? '' : isLast ? '-translate-x-full' : '-translate-x-1/2'
                      }`}
                      style={{ left: ((h - dayStart) / 60) * HOUR_WIDTH + EDGE_PADDING }}
                    >
                      {formatTime(h)}
                    </div>
                  );
                })}
              </div>

              {/* Rijen met de rollen */}
              <div
                className="relative"
                style={{ height: rowCount * ROW_HEIGHT + (rowCount - 1) * ROW_GAP + 12 }}
              >
                {/* volle uren: duidelijke verticale lijn */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-slate-100"
                    style={{ left: ((h - dayStart) / 60) * HOUR_WIDTH + EDGE_PADDING }}
                  />
                ))}
                {/* halve uren: lichte hulplijn voor beter tijdsgevoel */}
                {halfHours.map((h) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-dashed border-slate-100"
                    style={{ left: ((h - dayStart) / 60) * HOUR_WIDTH + EDGE_PADDING }}
                  />
                ))}

                {scheduled.length === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                    Geen rollen met een tijdstip
                  </p>
                )}

                {scheduled.map(({ rol, start, end, row }) => {
                  const assigned = getAssigned(rol);
                  const count = assigned.length;
                  const full = !rol.is_default && count >= rol.plaatsen;
                  const left = ((start - dayStart) / 60) * HOUR_WIDTH + EDGE_PADDING;
                  const width = Math.max(((end - start) / 60) * HOUR_WIDTH, MIN_CARD_WIDTH);
                  const top = row * (ROW_HEIGHT + ROW_GAP) + 6;
                  const isSelected = selectedRolId === rol.id;

                  return (
                    <button
                      key={rol.id}
                      type="button"
                      onClick={() => setSelectedRolId(isSelected ? null : rol.id)}
                      className={`absolute rounded-lg border text-left px-3 py-2 flex items-center justify-between gap-2 overflow-hidden transition-all ${
                        isSelected
                          ? 'border-[#041c3a] bg-[#041c3a]/5 ring-1 ring-[#041c3a] z-10'
                          : full
                          ? 'border-red-200 bg-red-50/60 hover:border-red-300'
                          : 'border-emerald-200 bg-emerald-50/40 hover:border-[#041c3a]/40 hover:bg-[#041c3a]/5'
                      }`}
                      style={{ left, width, top, height: ROW_HEIGHT }}
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#041c3a] truncate flex items-center gap-1">
                          {rol.is_default && <Shield className="w-2.5 h-2.5 text-[#ed6425] shrink-0" />}
                          {rol.naam}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 truncate">
                          {formatTime(start)}–{formatTime(end)}
                        </p>
                      </div>

                      {/* Aanwezigen: altijd zichtbaar, niet weggestopt achter een klik */}
                      {!rol.is_default && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <AvatarStack people={assigned} max={3} size="sm" />
                          <span className={`text-[10px] font-bold ${full ? 'text-red-500' : 'text-emerald-600'}`}>
                            {count}/{rol.plaatsen}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rollen zonder (herkenbaar) tijdstip */}
          {unscheduled.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Niet ingepland
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unscheduled.map((rol) => {
                  const assigned = getAssigned(rol);
                  const count = assigned.length;
                  const full = !rol.is_default && count >= rol.plaatsen;
                  const isSelected = selectedRolId === rol.id;
                  return (
                    <button
                      key={rol.id}
                      type="button"
                      onClick={() => setSelectedRolId(isSelected ? null : rol.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-2 transition-colors ${
                        isSelected
                          ? 'border-[#041c3a] bg-[#041c3a]/5 text-[#041c3a]'
                          : full
                          ? 'border-red-200 text-red-500 hover:border-red-300'
                          : 'border-slate-200 text-slate-500 hover:border-[#041c3a]/40'
                      }`}
                    >
                      {rol.is_default && <Shield className="w-2.5 h-2.5 text-[#ed6425]" />}
                      {rol.naam}
                      {!rol.is_default && (
                        <span className="flex items-center gap-1">
                          <AvatarStack people={assigned} max={2} size="sm" />
                          <span className="text-[9px] font-bold text-slate-400">
                            {count}/{rol.plaatsen}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailpaneel voor de geselecteerde rol */}
          {selectedRol &&
            (() => {
              const rol = selectedRol;
              const assigned = getAssigned(rol);
              const count = assigned.length;
              const full = !rol.is_default && count >= rol.plaatsen;
              const isIn = !!currentUserId && rol.toegewezen?.some((t) => t.user_id === currentUserId);
              const busy = busyRolId === rol.id;

              return (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#041c3a]">{rol.naam}</p>
                        {rol.is_default && (
                          <Badge className="text-[9px] bg-[#ed6425]/15 text-[#ed6425] border-0 px-1.5 py-0">
                            <Shield className="w-2.5 h-2.5 mr-1" />
                            Standaard
                          </Badge>
                        )}
                      </div>
                      {rol.start_uur && rol.eind_uur && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" /> {rol.start_uur.slice(0, 5)}–{rol.eind_uur.slice(0, 5)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canManageRollen && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(rol)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#041c3a] hover:bg-[#041c3a]/8 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!rol.is_default && (
                            <button
                              type="button"
                              onClick={() => handleDelete(rol.id)}
                              disabled={busy}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedRolId(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {rol.beschrijving && (
                    <p className="text-xs text-slate-500 leading-relaxed">{rol.beschrijving}</p>
                  )}

                  {!rol.is_default && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" /> Plaatsen
                        </span>
                        <span>
                          {count} / {rol.plaatsen}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${full ? 'bg-red-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(100, (count / rol.plaatsen) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aanwezigen altijd met naam zichtbaar, niet enkel als avatar */}
                  {count > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ingeschreven
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((p) => (
                          <div
                            key={p.user_id}
                            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-slate-50 border border-slate-200"
                          >
                            <Avatar name={p.name} size="sm" />
                            <span className="text-[11px] font-medium text-slate-600">{p.name}</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(rol, p.user_id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                title={`${p.name} verwijderen`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {canSignup && currentUserId && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isIn ? 'outline' : 'default'}
                      disabled={busy || (!isIn && full)}
                      onClick={() => handleToggleSelf(rol)}
                      className={
                        isIn
                          ? 'border-red-200 text-red-500 hover:bg-red-50 text-xs h-8 w-full'
                          : 'bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8 w-full'
                      }
                    >
                      {busy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isIn ? (
                        'Uitschrijven'
                      ) : full ? (
                        'Volzet'
                      ) : (
                        'Toewijzen'
                      )}
                    </Button>
                  )}
                </div>
              );
            })()}
        </>
      )}

      <RolFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditingRol(null);
        }}
        initial={editingRol}
        onSave={handleSave}
      />
    </div>
  );
}