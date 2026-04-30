import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Trash2, Plus, Sparkles, ListTodo } from 'lucide-react';
import type { Event } from '../../../types/event';
import { getAutoTodos, useEventTodos, type AnyTodo, type AutoTodo, type EventTodo } from '../../../hooks/useEventTodos';

interface EventTodoPanelProps {
  event: Event;
}

export function EventTodoPanel({ event }: EventTodoPanelProps) {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useEventTodos(event.id);
  const [newTekst, setNewTekst] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const autoTodos = getAutoTodos(event);
  const pendingAuto = autoTodos.filter((t) => !t.voltooid);
  const doneAuto = autoTodos.filter((t) => t.voltooid);

  const pendingCustom = todos.filter((t) => !t.voltooid);
  const doneCustom = todos.filter((t) => t.voltooid);

  const totalDone = doneAuto.length + doneCustom.length;
  const totalAll = autoTodos.length + todos.length;
  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleAdd = async () => {
    const t = newTekst.trim();
    if (!t) return;
    setNewTekst('');
    setAdding(false);
    await addTodo(t);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewTekst(''); }
  };

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#041c3a]/5 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#041c3a]">
          <ListTodo className="w-3.5 h-3.5 text-[#ed6425]" />
          Checklist
          {totalAll > 0 && (
            <Badge className="ml-0.5 text-[10px] bg-[#ed6425] text-white border-0 px-1.5 py-0">
              {totalDone}/{totalAll}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs h-7"
        >
          <Plus className="w-3 h-3 mr-1" />
          Toevoegen
        </Button>
      </div>

      {/* Progress bar */}
      {totalAll > 0 && (
        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-[#041c3a] to-[#ed6425] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="p-4 bg-white space-y-1">

        {/* Auto todos — pending */}
        {pendingAuto.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#ed6425]" />
              Vereiste velden
            </p>
            <div className="space-y-1">
              {pendingAuto.map((t) => (
                <AutoTodoRow key={t.id} todo={t} />
              ))}
            </div>
          </div>
        )}

        {/* Custom todos — pending */}
        {pendingCustom.length > 0 && (
          <div className="mb-3">
            {pendingAuto.length > 0 && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <ListTodo className="w-3 h-3" />
                Eigen taken
              </p>
            )}
            <div className="space-y-1">
              {pendingCustom.map((t) => (
                <CustomTodoRow key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </div>
          </div>
        )}

        {/* Add input */}
        {adding && (
          <div className="flex items-center gap-2 py-1">
            <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <Input
              ref={inputRef}
              value={newTekst}
              onChange={(e) => setNewTekst(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!newTekst.trim()) { setAdding(false); } }}
              placeholder="Nieuwe taak..."
              className="h-7 text-sm border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!newTekst.trim()}
              className="h-7 bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs px-2.5"
            >
              Ok
            </Button>
          </div>
        )}

        {/* Empty state */}
        {pendingAuto.length === 0 && pendingCustom.length === 0 && !adding && doneAuto.length === 0 && doneCustom.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-5 font-medium">
            Geen taken gevonden
          </p>
        )}

        {/* Completed section */}
        {(doneAuto.length > 0 || doneCustom.length > 0) && (
          <div className="pt-3 mt-2 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">
              Afgerond ({doneAuto.length + doneCustom.length})
            </p>
            <div className="space-y-1">
              {doneAuto.map((t) => (
                <AutoTodoRow key={t.id} todo={t} />
              ))}
              {doneCustom.map((t) => (
                <CustomTodoRow key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AutoTodoRow({ todo }: { todo: AutoTodo }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg group">
      {todo.voltooid ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
      )}
      <span
        className={`text-sm flex-1 ${
          todo.voltooid ? 'line-through text-slate-300' : 'text-slate-600'
        }`}
      >
        {todo.tekst}
      </span>
      <Badge
        variant="outline"
        className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-400 font-semibold uppercase tracking-wide hidden group-hover:flex"
      >
        auto
      </Badge>
    </div>
  );
}

function CustomTodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: EventTodo;
  onToggle: (id: string, voltooid: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg group hover:bg-slate-50 transition-colors">
      <button
        type="button"
        onClick={() => onToggle(todo.id, !todo.voltooid)}
        className="flex-shrink-0 text-slate-300 hover:text-[#041c3a] transition-colors"
      >
        {todo.voltooid ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </button>
      <span
        className={`text-sm flex-1 leading-snug ${
          todo.voltooid ? 'line-through text-slate-300' : 'text-slate-700'
        }`}
      >
        {todo.tekst}
      </span>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-0.5 rounded"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}