import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Trash2, RotateCcw } from 'lucide-react';

interface InventoryItem {
  id: string;
  naam: string;
  eenheid: string | null;
  totaal_stock: number;
  beschikbaar: number;
}

export interface EventInventoryEntry {
  id?: string; // existing DB row id
  inventory_id: string;
  naam?: string; // display only
  eenheid?: string | null;
  hoeveelheid: number;
  teruggegeven: boolean;
  notities: string;
}

interface EventInventorySectionProps {
  eventId?: string; // if editing existing event
  entries: EventInventoryEntry[];
  onChange: (entries: EventInventoryEntry[]) => void;
}

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

export function EventInventorySection({ entries, onChange }: EventInventorySectionProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    supabase
      .from('inventory_beschikbaar')
      .select('*')
      .order('naam')
      .then(({ data }) => {
        if (data) setInventory(data as InventoryItem[]);
      });
  }, []);

  function addEntry() {
    onChange([
      ...entries,
      { inventory_id: '', hoeveelheid: 1, teruggegeven: false, notities: '' },
    ]);
  }

  function updateEntry(idx: number, field: keyof EventInventoryEntry, value: unknown) {
    onChange(entries.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  }

  function removeEntry(idx: number) {
    onChange(entries.filter((_, i) => i !== idx));
  }

  function getItem(id: string) {
    return inventory.find((i) => i.id === id);
  }

  // Items already selected (to avoid double-picking)
  const selectedIds = entries.map((e) => e.inventory_id).filter(Boolean);

  return (
    <div className="space-y-3">
      {entries.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-5 font-medium">
          Nog geen inventaris toegewezen aan dit evenement
        </p>
      )}

      {entries.map((entry, idx) => {
        const item = getItem(entry.inventory_id);
        const maxAvail = item
          ? item.beschikbaar + (entry.id ? entry.hoeveelheid : 0) // if editing, add back current usage
          : 99;

        return (
          <div
            key={idx}
            className={`border rounded-lg p-3 space-y-3 transition-colors ${
              entry.teruggegeven
                ? 'bg-slate-50 border-slate-200 opacity-70'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#ed6425]/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-3 h-3 text-[#ed6425]" />
              </div>
              <span className="text-xs font-bold text-[#041c3a] uppercase tracking-wide">
                Item {idx + 1}
              </span>
              {entry.teruggegeven && (
                <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0">
                  Teruggegeven
                </Badge>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={labelClass}>Item *</Label>
                <Select
                  value={entry.inventory_id}
                  onValueChange={(v) => updateEntry(idx, 'inventory_id', v)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Kies item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((inv) => {
                      const alreadySelected =
                        selectedIds.includes(inv.id) && inv.id !== entry.inventory_id;
                      return (
                        <SelectItem
                          key={inv.id}
                          value={inv.id}
                          disabled={alreadySelected || inv.beschikbaar === 0}
                        >
                          <span className="flex items-center gap-2">
                            {inv.naam}
                            <span className="text-xs text-slate-400">
                              ({inv.beschikbaar} beschikbaar)
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>
                  Hoeveelheid {item?.eenheid ? `(${item.eenheid})` : ''}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={maxAvail}
                  value={entry.hoeveelheid}
                  onChange={(e) => updateEntry(idx, 'hoeveelheid', Number(e.target.value))}
                  className={inputClass}
                />
                {item && entry.hoeveelheid > maxAvail && (
                  <p className="text-[10px] text-red-500 font-medium">
                    Max {maxAvail} beschikbaar
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className={labelClass}>Notities</Label>
              <Input
                value={entry.notities}
                onChange={(e) => updateEntry(idx, 'notities', e.target.value)}
                placeholder="bv. goodies — niet terug, beamer ophalen bij..."
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id={`terug-${idx}`}
                checked={entry.teruggegeven}
                onCheckedChange={(v) => updateEntry(idx, 'teruggegeven', !!v)}
                className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor={`terug-${idx}`}
                className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer select-none"
              >
                <RotateCcw className="w-3 h-3 text-emerald-600" />
                Teruggegeven na evenement
              </label>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
        className="w-full border-dashed border-slate-300 text-slate-500 hover:border-[#041c3a]/40 hover:text-[#041c3a] text-xs h-8"
      >
        <Plus className="w-3 h-3 mr-1" />
        Item toevoegen aan evenement
      </Button>
    </div>
  );
}