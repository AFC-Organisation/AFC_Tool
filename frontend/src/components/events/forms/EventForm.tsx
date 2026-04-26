import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, User, Package } from 'lucide-react';
import type { Event, EventFormData, EventType, SprekerRol } from '../../../types/event';

interface EventFormProps {
  event?: Event | null;
  defaultType?: EventType;
  onSave: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ROL_OPTIONS: { value: SprekerRol; label: string }[] = [
  { value: 'spreker', label: 'Spreker' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'facilitator', label: 'Facilitator' },
];

interface SprekerForm {
  naam: string;
  email: string;
  telefoon: string;
  rol: SprekerRol;
  omschrijving: string;
  volgorde: number;
}

interface MateriaalForm {
  item: string;
  hoeveelheid: string;
  leverancier: string;
  contact_naam: string;
  contact_email: string;
  contact_telefoon: string;
}

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';

const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

// Reusable section wrapper — header is flush, no white gap
function Section({
  icon,
  title,
  badge,
  action,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  badge?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Flush header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#041c3a]/5 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#041c3a]">
          {icon && <span className="text-[#ed6425]">{icon}</span>}
          {title}
          {badge != null && badge > 0 && (
            <Badge className="ml-0.5 text-[10px] bg-[#ed6425] text-white border-0 px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        {action}
      </div>
      {/* Body */}
      <div className="p-4 bg-white space-y-4">
        {children}
      </div>
    </div>
  );
}

export function EventForm({ event, defaultType, onSave, onCancel, loading }: EventFormProps) {
  const [type, setType] = useState<EventType>(event?.type ?? defaultType ?? 'event');
  const [titel, setTitel] = useState(event?.titel ?? '');
  const [beschrijvingWebsite, setBeschrijvingWebsite] = useState(event?.beschrijving_website ?? '');
  const [beschrijvingSociaal, setBeschrijvingSociaal] = useState(event?.beschrijving_sociaal ?? '');
  const [eventDatum, setEventDatum] = useState(event?.event_datum ?? '');
  const [locatie, setLocatie] = useState(event?.locatie ?? '');
  const [maxDeelnemers, setMaxDeelnemers] = useState(event?.max_deelnemers?.toString() ?? '');
  const [deurenOpen, setDeurenOpen] = useState(event?.deuren_open ?? '');
  const [startTijd, setStartTijd] = useState(event?.start_tijd ?? '');
  const [eindeTijd, setEindeTijd] = useState(event?.einde_tijd ?? '');

  const [sprekers, setSprekers] = useState<SprekerForm[]>(
    event?.sprekers?.map((s) => ({
      naam: s.naam,
      email: s.email ?? '',
      telefoon: s.telefoon ?? '',
      rol: s.rol,
      omschrijving: s.omschrijving ?? '',
      volgorde: s.volgorde,
    })) ?? []
  );

  const [materiaal, setMateriaal] = useState<MateriaalForm[]>(
    event?.materiaal?.map((m) => ({
      item: m.item,
      hoeveelheid: m.hoeveelheid ?? '',
      leverancier: m.leverancier ?? '',
      contact_naam: m.contact_naam ?? '',
      contact_email: m.contact_email ?? '',
      contact_telefoon: m.contact_telefoon ?? '',
    })) ?? []
  );

  const addSpreker = () =>
    setSprekers((prev) => [
      ...prev,
      { naam: '', email: '', telefoon: '', rol: 'spreker', omschrijving: '', volgorde: prev.length },
    ]);

  const updateSpreker = (idx: number, field: keyof SprekerForm, value: string) =>
    setSprekers((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const removeSpreker = (idx: number) =>
    setSprekers((prev) => prev.filter((_, i) => i !== idx));

  const addMateriaal = () =>
    setMateriaal((prev) => [
      ...prev,
      { item: '', hoeveelheid: '', leverancier: '', contact_naam: '', contact_email: '', contact_telefoon: '' },
    ]);

  const updateMateriaal = (idx: number, field: keyof MateriaalForm, value: string) =>
    setMateriaal((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const removeMateriaal = (idx: number) =>
    setMateriaal((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      type,
      titel,
      beschrijving_website: beschrijvingWebsite || undefined,
      beschrijving_sociaal: beschrijvingSociaal || undefined,
      event_datum: eventDatum || undefined,
      locatie: locatie || undefined,
      max_deelnemers: maxDeelnemers ? Number(maxDeelnemers) : undefined,
      deuren_open: deurenOpen || undefined,
      start_tijd: startTijd || undefined,
      einde_tijd: eindeTijd || undefined,
      sprekers: sprekers.map((s, i) => ({ ...s, volgorde: i })),
      materiaal,
    });
  };

  const typeOptions: { value: EventType; label: string; color: string; activeColor: string }[] = [
    { value: 'event',    label: 'Event',    color: 'border-slate-200 text-slate-600 hover:border-[#041c3a]/40', activeColor: 'bg-[#041c3a] text-white border-[#041c3a]' },
    { value: 'workshop', label: 'Workshop', color: 'border-slate-200 text-slate-600 hover:border-[#ed6425]/40', activeColor: 'bg-[#ed6425] text-white border-[#ed6425]' },
    { value: 'project',  label: 'Project',  color: 'border-slate-200 text-slate-600 hover:border-[#041c3a]/40', activeColor: 'bg-[#041c3a]/70 text-white border-[#041c3a]/70' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Type selector */}
      {!event && (
        <div className="space-y-2">
          <p className={labelClass}>Type evenement *</p>
          <div className="flex gap-2">
            {typeOptions.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-bold tracking-wide transition-all ${
                  type === t.value ? t.activeColor : t.color
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Algemene informatie ── */}
      <Section title="Algemene informatie">
        <div className="space-y-1.5">
          <Label className={labelClass} htmlFor="titel">Titel *</Label>
          <Input
            id="titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="Naam van het evenement"
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="datum">Datum</Label>
            <Input
              id="datum"
              type="date"
              value={eventDatum}
              onChange={(e) => setEventDatum(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="locatie">Locatie</Label>
            <Input
              id="locatie"
              value={locatie}
              onChange={(e) => setLocatie(e.target.value)}
              placeholder="Zaal, gebouw, adres..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="deuren">Deuren open</Label>
            <Input id="deuren" type="time" value={deurenOpen} onChange={(e) => setDeurenOpen(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="start">Start</Label>
            <Input id="start" type="time" value={startTijd} onChange={(e) => setStartTijd(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="einde">Einde</Label>
            <Input id="einde" type="time" value={eindeTijd} onChange={(e) => setEindeTijd(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass} htmlFor="max">Max. deelnemers</Label>
          <Input
            id="max"
            type="number"
            value={maxDeelnemers}
            onChange={(e) => setMaxDeelnemers(e.target.value)}
            placeholder="Onbeperkt"
            min="0"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass} htmlFor="bwebsite">Beschrijving website</Label>
          <Textarea
            id="bwebsite"
            value={beschrijvingWebsite}
            onChange={(e) => setBeschrijvingWebsite(e.target.value)}
            placeholder="Beschrijving voor de website..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass} htmlFor="bsociaal">Beschrijving sociale media</Label>
          <Textarea
            id="bsociaal"
            value={beschrijvingSociaal}
            onChange={(e) => setBeschrijvingSociaal(e.target.value)}
            placeholder="Korte tekst voor sociale media..."
            rows={2}
            className={inputClass}
          />
        </div>
      </Section>

      {/* ── Sprekers & rollen ── */}
      <Section
        icon={<User className="w-3.5 h-3.5" />}
        title="Sprekers & rollen"
        badge={sprekers.length}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpreker}
            className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Toevoegen
          </Button>
        }
      >
        {sprekers.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-5 font-medium">
            Nog geen sprekers toegevoegd
          </p>
        )}
        <div className="space-y-3">
          {sprekers.map((spreker, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#041c3a] flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-[#041c3a] uppercase tracking-wide">
                  Spreker {idx + 1}
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => removeSpreker(idx)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className={labelClass}>Naam *</Label>
                  <Input value={spreker.naam} onChange={(e) => updateSpreker(idx, 'naam', e.target.value)} placeholder="Volledige naam" required className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Rol</Label>
                  <Select value={spreker.rol} onValueChange={(v) => updateSpreker(idx, 'rol', v)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROL_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className={labelClass}>Email</Label>
                  <Input type="email" value={spreker.email} onChange={(e) => updateSpreker(idx, 'email', e.target.value)} placeholder="email@voorbeeld.be" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Telefoon</Label>
                  <Input value={spreker.telefoon} onChange={(e) => updateSpreker(idx, 'telefoon', e.target.value)} placeholder="+32..." className={inputClass} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Omschrijving</Label>
                <Textarea value={spreker.omschrijving} onChange={(e) => updateSpreker(idx, 'omschrijving', e.target.value)} placeholder="Bio of omschrijving..." rows={2} className={inputClass} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Materiaal & logistiek ── */}
      <Section
        icon={<Package className="w-3.5 h-3.5" />}
        title="Materiaal & logistiek"
        badge={materiaal.length}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMateriaal}
            className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Toevoegen
          </Button>
        }
      >
        {materiaal.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-5 font-medium">
            Nog geen materiaal toegevoegd
          </p>
        )}
        <div className="space-y-3">
          {materiaal.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#041c3a] uppercase tracking-wide">
                  Item {idx + 1}
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => removeMateriaal(idx)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className={labelClass}>Item *</Label>
                  <Input value={item.item} onChange={(e) => updateMateriaal(idx, 'item', e.target.value)} placeholder="Naam van het item" required className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Hoeveelheid</Label>
                  <Input value={item.hoeveelheid} onChange={(e) => updateMateriaal(idx, 'hoeveelheid', e.target.value)} placeholder="bv. 50 stuks" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className={labelClass}>Leverancier</Label>
                  <Input value={item.leverancier} onChange={(e) => updateMateriaal(idx, 'leverancier', e.target.value)} placeholder="Bedrijf" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Contactpersoon</Label>
                  <Input value={item.contact_naam} onChange={(e) => updateMateriaal(idx, 'contact_naam', e.target.value)} placeholder="Naam" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Contact email</Label>
                  <Input value={item.contact_email} onChange={(e) => updateMateriaal(idx, 'contact_email', e.target.value)} placeholder="email@..." className={inputClass} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Annuleren
        </Button>
        <Button
          type="submit"
          disabled={loading || !titel}
          className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white gap-2 font-semibold"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Opslaan...' : 'Concept opslaan'}
        </Button>
      </div>
    </form>
  );
}