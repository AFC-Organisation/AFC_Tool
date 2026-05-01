import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, RotateCcw, Package, AlertCircle, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: string;
  naam: string;
  beschrijving: string | null;
  totaal_stock: number;
  eenheid: string | null;
}

interface EventInventoryEntry {
  id: string;
  event_id: string;
  inventory_id: string;
  hoeveelheid: number;
  teruggegeven: boolean;
  notities: string | null;
  created_at: string;
  inventory?: InventoryItem;
}

// ─── Shared style tokens (must match EventForm) ───────────────────────────────

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventInventorySectionProps {
  eventId: string;
  /** Whether the event has already taken place (enables "returned" toggle) */
  eventAfgelopen?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EventInventorySection({
  eventId,
  eventAfgelopen = false,
}: EventInventorySectionProps) {
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [entries, setEntries] = useState<EventInventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // "Add" form state
  const [addOpen, setAddOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [addHoeveelheid, setAddHoeveelheid] = useState('1');
  const [addNotities, setAddNotities] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function fetchAll() {
    setLoading(true);
    const [{ data: invData }, { data: entryData }] = await Promise.all([
      supabase.from('inventory').select('*').order('naam'),
      supabase
        .from('event_inventory')
        .select(`
          id, event_id, inventory_id, hoeveelheid, teruggegeven, notities, created_at,
          inventory:inventory(id, naam, beschrijving, totaal_stock, eenheid)
        `)
        .eq('event_id', eventId),
    ]);

    if (invData) setAllInventory(invData);
    if (entryData) setEntries(entryData as EventInventoryEntry[]);
    setLoading(false);
  }

  /** How many units of an inventory item are still available (globally assigned - returned) */
  function getBeschikbaar(inventoryId: string): number {
    const inv = allInventory.find((i) => i.id === inventoryId);
    if (!inv) return 0;
    // This is a simplified calculation — ideally you'd query total assigned across ALL events
    // For now we just check if adding exceeds stock for THIS event
    const alreadyAssigned = entries
      .filter((e) => e.inventory_id === inventoryId)
      .reduce((sum, e) => sum + e.hoeveelheid, 0);
    return inv.totaal_stock - alreadyAssigned;
  }

  async function handleAdd() {
    if (!selectedInventoryId || !addHoeveelheid) return;
    const hoeveelheid = Number(addHoeveelheid);
    if (hoeveelheid <= 0) return;

    const beschikbaar = getBeschikbaar(selectedInventoryId);
    if (hoeveelheid > beschikbaar) {
      setAddError(`Slechts ${beschikbaar} beschikbaar.`);
      return;
    }

    setSaving(true);
    setAddError('');
    const { error } = await supabase.from('event_inventory').insert({
      event_id: eventId,
      inventory_id: selectedInventoryId,
      hoeveelheid,
      notities: addNotities || null,
    });
    setSaving(false);

    if (error) {
      setAddError('Er is iets misgegaan. Probeer opnieuw.');
      return;
    }

    setAddOpen(false);
    setSelectedInventoryId('');
    setAddHoeveelheid('1');
    setAddNotities('');
    fetchAll();
  }

  async function handleDelete(entryId: string) {
    await supabase.from('event_inventory').delete().eq('id', entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  async function handleToggleTeruggegeven(entry: EventInventoryEntry) {
    const newVal = !entry.teruggegeven;
    await supabase
      .from('event_inventory')
      .update({ teruggegeven: newVal })
      .eq('id', entry.id);
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, teruggegeven: newVal } : e))
    );
  }

  async function handleUpdateHoeveelheid(entry: EventInventoryEntry, newHoeveelheid: number) {
    if (newHoeveelheid <= 0) return;
    await supabase
      .from('event_inventory')
      .update({ hoeveelheid: newHoeveelheid })
      .eq('id', entry.id);
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, hoeveelheid: newHoeveelheid } : e))
    );
  }

  // Items not yet assigned (avoid double-adding the same inventory item)
  const alreadyAssignedIds = new Set(entries.map((e) => e.inventory_id));
  const availableToAdd = allInventory.filter((i) => !alreadyAssignedIds.has(i.id));

  const selectedItem = allInventory.find((i) => i.id === selectedInventoryId);

  if (loading) {
    return <p className="text-xs text-slate-400 text-center py-6">Laden...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Assigned items list */}
      {entries.length === 0 && !addOpen && (
        <p className="text-xs text-slate-400 text-center py-5 font-medium">
          Nog geen stock toegewezen aan dit evenement
        </p>
      )}

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => {
            const inv = entry.inventory;
            const displayNaam = inv?.naam ?? 'Onbekend item';
            const displayEenheid = inv?.eenheid ?? 'stuks';
            const stockMax = inv?.totaal_stock ?? entry.hoeveelheid;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-[#041c3a]/8 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[#041c3a]/60" />
                </div>

                {/* Name + stock */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#041c3a] truncate">{displayNaam}</p>
                  {inv?.beschrijving && (
                    <p className="text-xs text-slate-400 truncate">{inv.beschrijving}</p>
                  )}
                </div>

                {/* Quantity input */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateHoeveelheid(entry, entry.hoeveelheid - 1)}
                    disabled={entry.hoeveelheid <= 1}
                    className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:border-[#041c3a]/40 hover:text-[#041c3a] disabled:opacity-30 flex items-center justify-center text-sm font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-[#041c3a] w-8 text-center tabular-nums">
                    {entry.hoeveelheid}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateHoeveelheid(entry, entry.hoeveelheid + 1)}
                    disabled={entry.hoeveelheid >= stockMax}
                    className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:border-[#041c3a]/40 hover:text-[#041c3a] disabled:opacity-30 flex items-center justify-center text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400 ml-0.5">{displayEenheid}</span>
                </div>

                {/* Returned badge + toggle (only after event) */}
                {eventAfgelopen && (
                  <button
                    type="button"
                    onClick={() => handleToggleTeruggegeven(entry)}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border transition-colors shrink-0 ${
                      entry.teruggegeven
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                    title={entry.teruggegeven ? 'Markeer als niet teruggegeven' : 'Markeer als teruggegeven'}
                  >
                    {entry.teruggegeven ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Terug
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        Uitstaand
                      </>
                    )}
                  </button>
                )}

                {!eventAfgelopen && (
                  <Badge
                    className={`text-[10px] border px-1.5 py-0 shrink-0 ${
                      entry.teruggegeven
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {entry.teruggegeven ? 'Teruggegeven' : 'Toegewezen'}
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Return summary (post-event) */}
      {eventAfgelopen && entries.length > 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-3 py-2.5 flex items-center gap-3">
          <div className="flex-1 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">
              {entries.filter((e) => e.teruggegeven).length}
            </span>{' '}
            van {entries.length} items teruggegeven
          </div>
          {entries.some((e) => !e.teruggegeven) && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {entries.filter((e) => !e.teruggegeven).length} uitstaand
            </div>
          )}
        </div>
      )}

      {/* Add form (inline) */}
      {addOpen ? (
        <div className="rounded-lg border border-[#041c3a]/20 bg-[#041c3a]/3 p-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
            Stock toevoegen
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className={labelClass}>Inventaris item *</Label>
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Alle items zijn al toegewezen.</p>
              ) : (
                <Select
                  value={selectedInventoryId}
                  onValueChange={(v) => {
                    setSelectedInventoryId(v);
                    setAddError('');
                  }}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Kies een item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        <span>{inv.naam}</span>
                        <span className="ml-2 text-slate-400 text-xs">
                          ({inv.totaal_stock} {inv.eenheid ?? 'stuks'} beschikbaar)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>
                Hoeveelheid *
                {selectedItem && (
                  <span className="ml-1 text-slate-400 normal-case font-normal">
                    (max {getBeschikbaar(selectedInventoryId)} {selectedItem.eenheid ?? 'stuks'})
                  </span>
                )}
              </Label>
              <Input
                type="number"
                value={addHoeveelheid}
                onChange={(e) => {
                  setAddHoeveelheid(e.target.value);
                  setAddError('');
                }}
                min="1"
                max={selectedItem ? getBeschikbaar(selectedInventoryId) : undefined}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Notities</Label>
              <Input
                value={addNotities}
                onChange={(e) => setAddNotities(e.target.value)}
                placeholder="Opmerkingen..."
                className={inputClass}
              />
            </div>
          </div>

          {addError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {addError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={saving || !selectedInventoryId || !addHoeveelheid}
              className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white text-xs h-8 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {saving ? 'Toevoegen...' : 'Toevoegen'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setSelectedInventoryId('');
                setAddHoeveelheid('1');
                setAddNotities('');
                setAddError('');
              }}
              className="border-slate-200 text-slate-600 text-xs h-8"
            >
              Annuleren
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAddOpen(true)}
          className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs h-7 w-full border-dashed"
        >
          <Plus className="w-3 h-3 mr-1" />
          Stock toevoegen
        </Button>
      )}
    </div>
  );
}

// ─── Usage in EventForm ───────────────────────────────────────────────────────
//
// Add this inside EventForm, after the "Materiaal & logistiek" section:
//
// import { Archive } from 'lucide-react';
// import { EventInventorySection } from './EventInventorySection';
//
// {event?.id && (
//   <Section
//     icon={<Archive className="w-3.5 h-3.5" />}
//     title="Inventaris & stock"
//   >
//     <EventInventorySection
//       eventId={event.id}
//       eventAfgelopen={
//         event.event_datum
//           ? new Date(event.event_datum) < new Date()
//           : false
//       }
//     />
//   </Section>
// )}