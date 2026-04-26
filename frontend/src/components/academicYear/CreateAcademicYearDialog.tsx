import { useState } from 'react';
import { Plus, Loader2, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateAcademicYearInput } from '../types/academiejaar';

interface CreateAcademicYearDialogProps {
  onConfirm: (input: CreateAcademicYearInput) => Promise<void>;
  loading: boolean;
}

function generateYearName(start: string): string {
  if (!start) return '';
  const year = new Date(start).getFullYear();
  return `${year}-${year + 1}`;
}

export function CreateAcademicYearDialog({ onConfirm, loading }: CreateAcademicYearDialogProps) {
  const [open, setOpen] = useState(false);
  const [naam, setNaam] = useState('');
  const [startDatum, setStartDatum] = useState('');
  const [eindDatum, setEindDatum] = useState('');
  const [isHuidig, setIsHuidig] = useState(false);
  const [autoName, setAutoName] = useState(true);

  function handleStartChange(val: string) {
    setStartDatum(val);
    if (autoName) setNaam(generateYearName(val));
  }

  async function handleSubmit() {
    if (!naam || !startDatum || !eindDatum) return;
    await onConfirm({ naam, start_datum: startDatum, eind_datum: eindDatum, is_huidig: isHuidig });
    setNaam('');
    setStartDatum('');
    setEindDatum('');
    setIsHuidig(false);
    setAutoName(true);
    setOpen(false);
  }

  const isValid = naam.trim() && startDatum && eindDatum && new Date(eindDatum) > new Date(startDatum);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#ed6425] hover:bg-[#d4561f] text-white gap-2 font-semibold shadow-sm shadow-[#ed6425]/20">
          <Plus className="h-4 w-4" />
          Nieuw academiejaar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#041c3a]">
              <GraduationCap className="h-4.5 w-4.5 text-[#ed6425]" />
            </div>
            <DialogTitle className="text-[#041c3a] text-lg font-bold">
              Nieuw academiejaar
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-sm">
            Vul de gegevens in voor het nieuwe academiejaar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Start datum */}
          <div className="space-y-1.5">
            <Label htmlFor="start_datum" className="text-[#041c3a] font-semibold text-sm">
              Startdatum
            </Label>
            <Input
              id="start_datum"
              type="date"
              value={startDatum}
              onChange={(e) => handleStartChange(e.target.value)}
              className="border-slate-200 focus-visible:ring-[#ed6425]/30 focus-visible:border-[#ed6425]"
            />
          </div>

          {/* Eind datum */}
          <div className="space-y-1.5">
            <Label htmlFor="eind_datum" className="text-[#041c3a] font-semibold text-sm">
              Einddatum
            </Label>
            <Input
              id="eind_datum"
              type="date"
              value={eindDatum}
              min={startDatum}
              onChange={(e) => setEindDatum(e.target.value)}
              className="border-slate-200 focus-visible:ring-[#ed6425]/30 focus-visible:border-[#ed6425]"
            />
          </div>

          {/* Naam */}
          <div className="space-y-1.5">
            <Label htmlFor="naam" className="text-[#041c3a] font-semibold text-sm">
              Naam
            </Label>
            <Input
              id="naam"
              placeholder="bv. 2025-2026"
              value={naam}
              onChange={(e) => {
                setNaam(e.target.value);
                setAutoName(false);
              }}
              className="border-slate-200 focus-visible:ring-[#ed6425]/30 focus-visible:border-[#ed6425]"
            />
            <p className="text-xs text-slate-400">Automatisch ingevuld op basis van de startdatum.</p>
          </div>

          {/* Is huidig */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#041c3a]/4 border border-[#041c3a]/10">
            <input
              id="is_huidig"
              type="checkbox"
              checked={isHuidig}
              onChange={(e) => setIsHuidig(e.target.checked)}
              className="h-4 w-4 accent-[#ed6425] cursor-pointer rounded"
            />
            <div>
              <Label htmlFor="is_huidig" className="cursor-pointer font-semibold text-[#041c3a] text-sm">
                Instellen als huidig academiejaar
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Het huidige actieve academiejaar wordt dan automatisch gewijzigd.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="border-slate-200 text-slate-600 hover:text-[#041c3a] hover:border-[#041c3a]/30"
          >
            Annuleren
          </Button>
          <Button
            className="bg-[#041c3a] hover:bg-[#062d5f] text-white font-semibold"
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Aanmaken
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}