import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventRol, EventRolFormData } from '../types/event';

export function useEventRollen(eventId?: string) {
  const [rollen, setRollen] = useState<EventRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRollen = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: rolData, error: rolError } = await supabase
        .from('event_rollen')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (rolError) throw rolError;

      const rolIds = (rolData ?? []).map((r) => r.id);
      let toewijzingen: any[] = [];

      if (rolIds.length) {
        const { data: twData, error: twError } = await supabase
          .from('event_rol_users')
          .select('*')
          .in('event_rol_id', rolIds);
        if (twError) throw twError;
        toewijzingen = twData ?? [];
      }

      let userMap = new Map<string, any>();
      if (toewijzingen.length) {
        const userIds = [...new Set(toewijzingen.map((t) => t.user_id))];
        const { data: usersInfo } = await supabase.rpc('get_users_info', { user_ids: userIds });
        userMap = new Map((usersInfo ?? []).map((u: any) => [u.id, u]));
      }

      const merged: EventRol[] = (rolData ?? []).map((r) => ({
        ...r,
        toegewezen: toewijzingen
          .filter((t) => t.event_rol_id === r.id)
          .map((t) => {
            const u = userMap.get(t.user_id);
            return {
              ...t,
              user_email: u?.email ?? t.user_id,
              user_naam: u?.full_name ?? null,
            };
          }),
      }));

      setRollen(merged);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRollen();
  }, [fetchRollen]);

  return { rollen, loading, error, refetch: fetchRollen };
}

export function useEventRolMutations() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRol(eventId: string, input: EventRolFormData) {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from('event_rollen').insert({
        event_id: eventId,
        naam: input.naam,
        beschrijving: input.beschrijving || null,
        uren: input.uren,
        plaatsen: input.plaatsen,
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateRol(rolId: string, input: EventRolFormData) {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('event_rollen')
        .update({
          naam: input.naam,
          beschrijving: input.beschrijving || null,
          uren: input.uren,
          plaatsen: input.plaatsen,
        })
        .eq('id', rolId);
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteRol(rolId: string) {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from('event_rollen').delete().eq('id', rolId);
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function assignSelf(rolId: string, userId: string) {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('event_rol_users')
        .insert({ event_rol_id: rolId, user_id: userId });
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function unassign(rolId: string, userId: string) {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('event_rol_users')
        .delete()
        .eq('event_rol_id', rolId)
        .eq('user_id', userId);
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, createRol, updateRol, deleteRol, assignSelf, unassign };
}