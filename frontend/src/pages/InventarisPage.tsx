import { useState, useEffect } from 'react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

interface InventoryItem {
  id: string;
  naam: string;
  beschrijving: string | null;
  totaal_stock: number;
  eenheid: string | null;
  created_at: string;
  // from the view
  uitgeleend?: number;
  beschikbaar?: number;
}

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

const emptyForm = { naam: '', beschrijving: '', totaal_stock: '', eenheid: '' };

export function InventarisPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    // Join with event_inventory to calculate uitgeleend
    const { data, error } = await supabase
      .from('inventory_beschikbaar')
      .select('*')
      .order('naam');
    if (!error && data) setItems(data as InventoryItem[]);
    setLoading(false);
  }

  function openAdd() {
    setEditItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setForm({
      naam: item.naam,
      beschrijving: item.beschrijving ?? '',
      totaal_stock: item.totaal_stock.toString(),
      eenheid: item.eenheid ?? '',
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.naam || !form.totaal_stock) return;
    setSaving(true);
    const payload = {
      naam: form.naam,
      beschrijving: form.beschrijving || null,
      totaal_stock: Number(form.totaal_stock),
      eenheid: form.eenheid || null,
    };
    if (editItem) {
      await supabase.from('inventory').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('inventory').insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    fetchItems();
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await supabase.from('inventory').delete().eq('id', deleteItem.id);
    setDeleteDialogOpen(false);
    setDeleteItem(null);
    fetchItems();
  }

  const filtered = items.filter((i) =>
    i.naam.toLowerCase().includes(search.toLowerCase())
  );

  function stockColor(item: InventoryItem) {
    const avail = item.beschikbaar ?? item.totaal_stock;
    const total = item.totaal_stock;
    if (avail === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (avail / total < 0.3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  return (
        <AppLayout
          title="Inventaris"
          subtitle="Overzicht alles dat we hebben"
        >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#041c3a]">Inventaris</h2>
          <p className="text-sm text-slate-500 mt-0.5">Beheer alle beschikbare materialen en stock</p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Item toevoegen
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Zoeken op naam..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={inputClass + ' max-w-sm'}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totaal items', value: items.length, color: 'text-[#041c3a]' },
          { label: 'Volledig beschikbaar', value: items.filter(i => (i.beschikbaar ?? i.totaal_stock) === i.totaal_stock).length, color: 'text-emerald-600' },
          { label: 'Laag / uitgeput', value: items.filter(i => (i.beschikbaar ?? i.totaal_stock) === 0 || ((i.beschikbaar ?? i.totaal_stock) / i.totaal_stock) < 0.3).length, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#041c3a]/5 hover:bg-[#041c3a]/5">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">Item</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">Eenheid</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#041c3a] text-center">Totaal stock</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#041c3a] text-center">Uitgeleend</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#041c3a] text-center">Beschikbaar</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                  Laden...
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">Geen items gevonden</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <p className="font-semibold text-[#041c3a] text-sm">{item.naam}</p>
                    {item.beschrijving && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.beschrijving}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">{item.eenheid ?? '—'}</TableCell>
                <TableCell className="text-center font-mono font-semibold text-[#041c3a]">
                  {item.totaal_stock}
                </TableCell>
                <TableCell className="text-center font-mono text-slate-500">
                  {item.uitgeleend ?? 0}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`font-mono font-bold border ${stockColor(item)}`}>
                    {item.beschikbaar ?? item.totaal_stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded text-slate-400 hover:text-[#041c3a] hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setDeleteItem(item); setDeleteDialogOpen(true); }}
                      className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#041c3a] font-bold">
              {editItem ? 'Item bewerken' : 'Nieuw item toevoegen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className={labelClass}>Naam *</Label>
              <Input
                value={form.naam}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder="bv. Microfoon, Beamer, Tafel..."
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Totaal stock *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totaal_stock}
                  onChange={(e) => setForm((f) => ({ ...f, totaal_stock: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Eenheid</Label>
                <Input
                  value={form.eenheid}
                  onChange={(e) => setForm((f) => ({ ...f, eenheid: e.target.value }))}
                  placeholder="stuks, dozen, m..."
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Beschrijving</Label>
              <Textarea
                value={form.beschrijving}
                onChange={(e) => setForm((f) => ({ ...f, beschrijving: e.target.value }))}
                placeholder="Optionele beschrijving of notities..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
              Annuleren
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.naam || !form.totaal_stock}
              className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#041c3a]">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Item verwijderen
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Ben je zeker dat je <strong>{deleteItem?.naam}</strong> wil verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200">
              Annuleren
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  );
}