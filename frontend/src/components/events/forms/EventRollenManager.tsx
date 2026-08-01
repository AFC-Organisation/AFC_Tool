import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Clock, Users as UsersIcon, X, Loader2, Shield } from 'lucide-react';
import { RolFormDialog } from './RolFormDialog';
import { useEventRollen, useEventRolMutations } from '../../../hooks/useEventRollen';
import type { EventRol, EventStatus, EventRolFormData } from '../../../types/event';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0`}
      title={name}
    >
      {initials}
    </div>
  );
}

interface EventRollenManagerProps {
  eventId: string;
  eventStatus: EventStatus;
  isAdmin: boolean;
  currentUserId: string | null;
}

export function EventRollenManager({ eventId, eventStatus, isAdmin, currentUserId }: EventRollenManagerProps) {
  const { rollen, loading, refetch } = useEventRollen(eventId);
  const { createRol, updateRol, deleteRol, assignSelf, unassign } = useEventRolMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<EventRol | null>(null);
  const [busyRolId, setBusyRolId] = useState<string | null>(null);

  // Roles can only be created/edited/deleted while the event is still in concept.
  const canManageRollen = isAdmin && eventStatus === 'concept';
  // Self sign-up is open during concept and voorbereid.
  const canSignup = eventStatus === 'concept' || eventStatus === 'voorbereid';

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {rollen.length} rol{rollen.length !== 1 ? 'len' : ''}
        </p>
        {canManageRollen && (
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
        <div className="grid gap-3 sm:grid-cols-2">
          {rollen.map((rol) => {
            const count = rol.toegewezen?.length ?? 0;
            const full = !rol.is_default && count >= rol.plaatsen;
            const isIn = !!currentUserId && rol.toegewezen?.some((t) => t.user_id === currentUserId);
            const busy = busyRolId === rol.id;

            return (
              <div key={rol.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#041c3a]">{rol.naam}</p>
                      {rol.is_default && (
                        <Badge className="text-[9px] bg-[#ed6425]/15 text-[#ed6425] border-0 px-1.5 py-0">
                          <Shield className="w-2.5 h-2.5 mr-1" />
                          Standaard
                        </Badge>
                      )}
                    </div>
                    {rol.uren && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" /> {rol.uren}
                      </p>
                    )}
                  </div>
                  {canManageRollen && (
                    <div className="flex gap-1 shrink-0">
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
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col">
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

                  <div className="flex-1" />

                  {count > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rol.toegewezen!.map((t) => {
                        const name = t.user_naam ?? t.user_email?.split('@')[0] ?? 'Gebruiker';
                        return (
                          <div key={t.user_id} className="relative group">
                            <Avatar name={name} />
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(rol, t.user_id)}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title={`${name} verwijderen`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
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
              </div>
            );
          })}
        </div>
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