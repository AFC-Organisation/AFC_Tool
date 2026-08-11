import { useRef, useEffect } from 'react';
import { ListFilter, X } from 'lucide-react';
import type { AnalyticsEvent } from '../../hooks/useAnalytics';

interface EventMultiSelectFilterProps {
  events: AnalyticsEvent[]; // lijst om uit te kiezen (na type-filter)
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function EventMultiSelectFilter({ events, selectedIds, onChange }: EventMultiSelectFilterProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.open = false;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className={`list-none flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all
          ${selectedIds.length > 0
            ? 'bg-[#041c3a] text-white border-transparent shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
      >
        <ListFilter className="h-3.5 w-3.5" />
        <span>Specifieke evenementen</span>
        {selectedIds.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-white/25 text-white">
            {selectedIds.length}
          </span>
        )}
      </summary>

      <div className="absolute z-20 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-2">
        {selectedIds.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg py-1.5 mb-1"
          >
            <X className="h-3 w-3" />
            Selectie wissen
          </button>
        )}

        {events.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Geen evenementen beschikbaar</p>
        )}

        {events.map((e) => {
          const checked = selectedIds.includes(e.id);
          return (
            <label
              key={e.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(e.id)}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-[#ed6425]"
              />
              <span className="text-sm text-slate-700 truncate">{e.titel}</span>
            </label>
          );
        })}
      </div>
    </details>
  );
}