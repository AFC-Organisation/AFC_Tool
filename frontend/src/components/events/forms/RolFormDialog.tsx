import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Clock, Users as UsersIcon } from 'lucide-react';
import type { EventRol, EventRolFormData } from '../../../types/event';

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400 text-sm';
const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1';

interface RolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: EventRol | null;
  onSave: (data: EventRolFormData) => Promise<void>;
}

export function RolFormDialog({ open, onOpenChange, initial, onSave }: RolFormDialogProps) {
  const [naam, setNaam] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [uren, setUren] = useState('');
  const [plaatsen, setPlaatsen] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNaam(initial?.naam ?? '');
      setBeschrijving(initial?.beschrijving ?? '');
      setUren(initial?.uren ?? '');
      setPlaatsen(initial?.plaatsen?.toString() ?? '1');
    }
  }, [open, initial]);

  const valid = !!naam && !!uren && Number(plaatsen) > 0;

  async function handleSave() {
    if (!valid) return;
    setSaving(true);
    await onSave({ naam, beschrijving, uren, plaatsen: Number(plaatsen) });
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#041c3a] font-bold">
            {initial ? 'Rol bewerken' : 'Nieuwe rol aanmaken'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className={labelClass}>Naam *</Label>
            <Input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bv. Bar, Onthaal, Techniek..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>
                <Clock className="w-3 h-3" /> Uren *
              </Label>
              <Input
                value={uren}
                onChange={(e) => setUren(e.target.value)}
                placeholder="17:00 of 20:00-23:30"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>
                <UsersIcon className="w-3 h-3" /> Plaatsen *
              </Label>
              <Input
                type="number"
                min={1}
                value={plaatsen}
                onChange={(e) => setPlaatsen(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Beschrijving</Label>
            <Textarea
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Wat moet deze rol doen?"
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200">
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !valid}
            className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}