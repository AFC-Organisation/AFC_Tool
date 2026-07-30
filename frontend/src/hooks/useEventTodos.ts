import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '../types/event';

export interface EventTodo {
  id: string;
  event_id: string;
  tekst: string;
  voltooid: boolean;
  volgorde: number;
  created_at: string;
  isAuto?: false;
}

export interface AutoTodo {
  id: string;
  tekst: string;
  voltooid: boolean;
  isAuto: true;
}

export type AnyTodo = EventTodo | AutoTodo;

/** Derives which fields are still missing on the event */
export function getAutoTodos(event: Event): AutoTodo[] {
  const checks: { id: string; label: string; filled: boolean }[] = [
    {
      id: 'auto_datum',
      label: 'Datum invullen',
      filled: !!event.event_datum,
    },
    {
      id: 'auto_locatie',
      label: 'Locatie invullen',
      filled: !!event.locatie,
    },
    {
      id: 'auto_tijden',
      label: 'Start- en eindtijd instellen',
      filled: !!(event.start_tijd && event.einde_tijd),
    },
    {
      id: 'auto_max',
      label: 'Maximum deelnemers instellen',
      filled: !!event.max_deelnemers,
    },
    {
      id: 'auto_beschrijving_website',
      label: 'Beschrijving voor website schrijven',
      filled: !!event.beschrijving_website,
    },
    {
      id: 'auto_beschrijving_sociaal',
      label: 'Beschrijving voor sociale media schrijven',
      filled: !!event.beschrijving_sociaal,
    },
    {
      id: 'auto_sprekers',
      label: 'Minstens één spreker toevoegen',
      filled: !!(event.sprekers && event.sprekers.length > 0),
    },
  ];

  return checks.map(({ id, label, filled }: { id: string; label: string; filled: boolean }) => ({
    id,
    tekst: label,
    voltooid: filled,
    isAuto: true as const,
  }));
}

export function useEventTodos(eventId: string) {
  const [todos, setTodos] = useState<EventTodo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from('event_todos')
      .select('*')
      .eq('event_id', eventId)
      .order('volgorde', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) setTodos(data);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (tekst: string) => {
    const volgorde = todos.length;
    const { data, error } = await supabase
      .from('event_todos')
      .insert({ event_id: eventId, tekst, voltooid: false, volgorde })
      .select()
      .single();

    if (!error && data) setTodos((prev) => [...prev, data]);
  };

  const toggleTodo = async (id: string, voltooid: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, voltooid } : t))
    );
    await supabase.from('event_todos').update({ voltooid }).eq('id', id);
  };

  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('event_todos').delete().eq('id', id);
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo, refetch: fetchTodos };
}
