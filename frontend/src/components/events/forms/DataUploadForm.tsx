import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  UserPlus,
  MessageSquarePlus,
  CheckCircle2,
  AlertCircle,
  Users,
  MessageSquare,
  Euro,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { Event, Registration, Feedback } from '../../../types/event';
import {
  parseTallyCSV,
  parseTicketTailorCSV,
  parseFeedbackCSV,
  parseTicketTailorHTML,
  readFileAsText,
} from '../../../lib/csvParser';

interface DataUploadFormProps {
  event: Event;
  onImportTally: (data: any[]) => Promise<boolean>;
  onImportTicketTailor: (data: any[]) => Promise<boolean>;
  onImportFeedback: (data: any[]) => Promise<boolean>;
  onAddManualRegistration: (data: Partial<Registration>) => Promise<boolean>;
  onAddManualFeedback: (data: Partial<Feedback>) => Promise<boolean>;
  onMarkComplete: () => void;
  loading?: boolean;
  onImportFromTicketTailorAPI: (ticketTailorEventId: string) => Promise<boolean>;
  /** Save the financial result (can be negative) back to the events table */
  onUpdateFinancieel: (value: number | null) => Promise<boolean>;
}

interface UploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  count?: number;
  message?: string;
}

const inputClass =
  'border-slate-200 bg-white focus-visible:ring-[#041c3a]/30 focus-visible:border-[#041c3a] text-[#041c3a] placeholder:text-slate-400';

const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

export function DataUploadForm({
  event,
  onImportTally,
  onImportTicketTailor,
  onImportFeedback,
  onAddManualRegistration,
  onAddManualFeedback,
  onMarkComplete,
  loading,
  onImportFromTicketTailorAPI,
  onUpdateFinancieel,
}: DataUploadFormProps) {
  const [tallyState, setTallyState] = useState<UploadState>({ status: 'idle' });
  const [ttState, setTtState] = useState<UploadState>({ status: 'idle' });
  const [feedbackState, setFeedbackState] = useState<UploadState>({ status: 'idle' });
  const [showManualReg, setShowManualReg] = useState(false);
  const [showManualFb, setShowManualFb] = useState(false);
  const [manualReg, setManualReg] = useState({ naam: '', email: '', faculteit: '', studiejaar: '' });
  const [manualFb, setManualFb] = useState({
    email: '', schaal_1: '', schaal_2: '', schaal_3: '',
    wat_kon_beter: '', favo_onderdeel: '', andere_opmerkingen: '',
  });
  const [ttEventId, setTtEventId] = useState('');

  // Financial result state — seeded from event data
  const [financieelInput, setFinancieelInput] = useState<string>(
    event.financieel_resultaat != null ? String(event.financieel_resultaat) : ''
  );
  const [financieelSaveState, setFinancieelSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const tallyRef = useRef<HTMLInputElement>(null);
  const ttCsvRef = useRef<HTMLInputElement>(null);
  const ttHtmlRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLInputElement>(null);

  const handleFinancieelSave = async () => {
    const parsed = financieelInput === '' ? null : parseFloat(financieelInput.replace(',', '.'));
    if (financieelInput !== '' && isNaN(parsed as number)) return;
    setFinancieelSaveState('saving');
    const ok = await onUpdateFinancieel(parsed);
    setFinancieelSaveState(ok ? 'saved' : 'error');
    setTimeout(() => setFinancieelSaveState('idle'), 2500);
  };

  const financieelValue = financieelInput === '' ? null : parseFloat(financieelInput.replace(',', '.'));
  const isPositive = financieelValue !== null && !isNaN(financieelValue) && financieelValue >= 0;
  const isNegative = financieelValue !== null && !isNaN(financieelValue) && financieelValue < 0;

  const handleAPIImport = async () => {
    setTtState({ status: 'loading' });
    const ok = await onImportFromTicketTailorAPI(ttEventId);
    setTtState(ok ? { status: 'success' } : { status: 'error', message: 'API import mislukt' });
  };

  const handleTallyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTallyState({ status: 'loading' });
    try {
      const text = await readFileAsText(file);
      const rows = parseTallyCSV(text);
      const ok = await onImportTally(rows);
      setTallyState(ok ? { status: 'success', count: rows.length } : { status: 'error', message: 'Import mislukt' });
    } catch {
      setTallyState({ status: 'error', message: 'Fout bij verwerken van bestand' });
    }
  };

  const handleTTCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTtState({ status: 'loading' });
    try {
      const text = await readFileAsText(file);
      const rows = parseTicketTailorCSV(text);
      const ok = await onImportTicketTailor(rows);
      setTtState(ok ? { status: 'success', count: rows.length } : { status: 'error', message: 'Import mislukt' });
    } catch {
      setTtState({ status: 'error', message: 'Fout bij verwerken van bestand' });
    }
  };

  const handleTTHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTtState({ status: 'loading' });
    try {
      const text = await readFileAsText(file);
      const rows = parseTicketTailorHTML(text);
      const ok = await onImportTicketTailor(rows as any[]);
      setTtState(ok ? { status: 'success', count: rows.length } : { status: 'error', message: 'Import mislukt' });
    } catch {
      setTtState({ status: 'error', message: 'Fout bij verwerken van bestand' });
    }
  };

  const handleFeedbackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedbackState({ status: 'loading' });
    try {
      const text = await readFileAsText(file);
      const rows = parseFeedbackCSV(text);
      const ok = await onImportFeedback(rows);
      setFeedbackState(ok ? { status: 'success', count: rows.length } : { status: 'error', message: 'Import mislukt' });
    } catch {
      setFeedbackState({ status: 'error', message: 'Fout bij verwerken van bestand' });
    }
  };

  const UploadStatusIcon = ({ state }: { state: UploadState }) => {
    if (state.status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    if (state.status === 'error') return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    return null;
  };

  const regCount = event.registraties?.length ?? 0;
  const fbCount = event.feedback?.length ?? 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualReg.email);

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#041c3a] rounded-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Inschrijvingen</p>
            <p className="text-3xl font-black mt-0.5">{regCount}</p>
          </div>
          <Users className="w-8 h-8 text-white/20" />
        </div>
        <div className="p-4 bg-[#ed6425] rounded-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Feedback</p>
            <p className="text-3xl font-black mt-0.5">{fbCount}</p>
          </div>
          <MessageSquare className="w-8 h-8 text-white/20" />
        </div>
      </div>

      {/* Financial result */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
            <Euro className="w-3.5 h-3.5 text-[#ed6425]" />
            Financieel resultaat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-xs text-slate-500 mb-3">
            Vul het totale financiële resultaat in (positief = winst, negatief = verlies).
          </p>
          <div className="flex items-center gap-3">
            {/* € prefix */}
            <div className="relative flex-1 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">
                €
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={financieelInput}
                onChange={(e) => {
                  setFinancieelInput(e.target.value);
                  setFinancieelSaveState('idle');
                }}
                onBlur={handleFinancieelSave}
                onKeyDown={(e) => e.key === 'Enter' && handleFinancieelSave()}
                className={`pl-7 ${inputClass} ${
                  isNegative
                    ? 'text-red-600 border-red-200 focus-visible:border-red-400 focus-visible:ring-red-100'
                    : isPositive
                    ? 'text-emerald-700 border-emerald-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-100'
                    : ''
                }`}
              />
            </div>

            {/* Trend icon */}
            {isPositive && <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />}

            {/* Save feedback */}
            {financieelSaveState === 'saving' && (
              <span className="text-xs text-slate-400">Opslaan…</span>
            )}
            {financieelSaveState === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Opgeslagen
              </span>
            )}
            {financieelSaveState === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5" /> Opslaan mislukt
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Gebruik een min-teken voor een negatief bedrag, bv. <span className="font-mono">-150.00</span>. Wijzigingen worden opgeslagen bij het verlaten van het veld.
          </p>
        </CardContent>
      </Card>

      {/* Registraties upload */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-[#ed6425]" />
            Inschrijvingen importeren
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="tally">
            <TabsList className="mb-4 bg-slate-100 p-0.5">
              <TabsTrigger
                value="tally"
                className="text-xs font-semibold data-[state=active]:bg-[#041c3a] data-[state=active]:text-white"
              >
                Tally (CSV)
              </TabsTrigger>
              <TabsTrigger
                value="tt"
                className="text-xs font-semibold data-[state=active]:bg-[#041c3a] data-[state=active]:text-white"
              >
                TicketTailor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tally" className="space-y-3">
              <p className="text-xs text-slate-500">
                Upload de CSV export van Tally met kolommen: Submission ID, first_name, last_name, email, etc.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => tallyRef.current?.click()}
                  disabled={tallyState.status === 'loading'}
                  className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  {tallyState.status === 'loading' ? 'Uploaden...' : 'CSV uploaden'}
                </Button>
                <UploadStatusIcon state={tallyState} />
                {tallyState.status === 'success' && (
                  <span className="text-xs text-emerald-600 font-semibold">{tallyState.count} rijen geïmporteerd</span>
                )}
                {tallyState.status === 'error' && (
                  <span className="text-xs text-red-500">{tallyState.message}</span>
                )}
              </div>
              <input ref={tallyRef} type="file" accept=".csv" className="hidden" onChange={handleTallyUpload} />
            </TabsContent>

            <TabsContent value="tt" className="space-y-3">
              <p className="text-xs text-slate-500">Upload de CSV of HTML export van TicketTailor.</p>
              <div className="flex gap-3 flex-wrap items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => ttCsvRef.current?.click()}
                  disabled={ttState.status === 'loading'}
                  className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  CSV uploaden
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => ttHtmlRef.current?.click()}
                  disabled={ttState.status === 'loading'}
                  className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  HTML uploaden
                </Button>
                <UploadStatusIcon state={ttState} />
                {ttState.status === 'success' && (
                  <span className="text-xs text-emerald-600 font-semibold">{ttState.count} rijen geïmporteerd</span>
                )}
                {ttState.status === 'error' && (
                  <span className="text-xs text-red-500">{ttState.message}</span>
                )}
              </div>
              <input ref={ttCsvRef} type="file" accept=".csv" className="hidden" onChange={handleTTCsvUpload} />
              <input ref={ttHtmlRef} type="file" accept=".html,.htm" className="hidden" onChange={handleTTHtmlUpload} />
              <div className="space-y-2">
                <Label className={labelClass}>TicketTailor Event ID</Label>
                <Input
                  placeholder="ev_..."
                  value={ttEventId}
                  onChange={(e) => setTtEventId(e.target.value)}
                  className={inputClass}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAPIImport}
                  disabled={!ttEventId || ttState.status === 'loading'}
                  className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs"
                >
                  Via API importeren
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowManualReg(true)}
              className="text-[#041c3a]/70 hover:text-[#041c3a] hover:bg-[#041c3a]/5 text-xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-2" />
              Manueel inschrijving toevoegen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback upload */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#ed6425]" />
            Feedback importeren
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-slate-500">
            Upload de CSV van het feedbackformulier met kolommen: Submission ID, email, Vraag_1, Vraag_2, Vraag_3, etc.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => feedbackRef.current?.click()}
              disabled={feedbackState.status === 'loading'}
              className="border-[#041c3a]/20 text-[#041c3a] hover:bg-[#041c3a] hover:text-white text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-2" />
              {feedbackState.status === 'loading' ? 'Uploaden...' : 'CSV uploaden'}
            </Button>
            <UploadStatusIcon state={feedbackState} />
            {feedbackState.status === 'success' && (
              <span className="text-xs text-emerald-600 font-semibold">{feedbackState.count} responses geïmporteerd</span>
            )}
            {feedbackState.status === 'error' && (
              <span className="text-xs text-red-500">{feedbackState.message}</span>
            )}
          </div>
          <input ref={feedbackRef} type="file" accept=".csv" className="hidden" onChange={handleFeedbackUpload} />

          <div className="pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowManualFb(true)}
              className="text-[#041c3a]/70 hover:text-[#041c3a] hover:bg-[#041c3a]/5 text-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 mr-2" />
              Manueel feedback toevoegen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complete button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onMarkComplete}
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-600 text-white gap-2 font-semibold shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          Evenement afronden als compleet
        </Button>
      </div>

      {/* Manual Registration Dialog */}
      <Dialog open={showManualReg} onOpenChange={setShowManualReg}>
        <DialogContent className="border-0 shadow-2xl p-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425]" />
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-[#041c3a] font-black">
                Manuele inschrijving toevoegen
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Naam</Label>
                  <Input value={manualReg.naam} onChange={(e) => setManualReg((p) => ({ ...p, naam: e.target.value }))} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Email *</Label>
                  <Input
                    type="email"
                    value={manualReg.email}
                    onChange={(e) => setManualReg((p) => ({ ...p, email: e.target.value }))}
                    required
                    className={inputClass}
                  />
                  {manualReg.email && !emailValid && (
                    <p className="text-[11px] text-red-500">Ongeldig e-mailadres.</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Faculteit</Label>
                  <Input value={manualReg.faculteit} onChange={(e) => setManualReg((p) => ({ ...p, faculteit: e.target.value }))} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Studiejaar</Label>
                  <Input value={manualReg.studiejaar} onChange={(e) => setManualReg((p) => ({ ...p, studiejaar: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => setShowManualReg(false)} className="border-slate-200 text-slate-600">
                Annuleren
              </Button>
              <Button
                onClick={async () => {
                  const clamp = (v: string) => {
                    const n = Number(v);
                    if (!v || isNaN(n) || n < 1 || n > 5) return undefined;
                    return n;
                  };
                  const ok = await onAddManualFeedback({
                    email: manualFb.email || undefined,
                    schaal_1: clamp(manualFb.schaal_1),
                    schaal_2: clamp(manualFb.schaal_2),
                    schaal_3: clamp(manualFb.schaal_3),
                    wat_kon_beter: manualFb.wat_kon_beter || undefined,
                    favo_onderdeel: manualFb.favo_onderdeel || undefined,
                    andere_opmerkingen: manualFb.andere_opmerkingen || undefined,
                  });
                  if (ok) { setShowManualFb(false); }
                }}
                className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white font-semibold"
              >
                Toevoegen
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Feedback Dialog */}
      <Dialog open={showManualFb} onOpenChange={setShowManualFb}>
        <DialogContent className="border-0 shadow-2xl p-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425]" />
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-[#041c3a] font-black">
                Manuele feedback toevoegen
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Email</Label>
                <Input type="email" value={manualFb.email} onChange={(e) => setManualFb((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['schaal_1', 'schaal_2', 'schaal_3'] as const).map((k, i) => (
                  <div key={k} className="space-y-1.5">
                    <Label className={labelClass}>Vraag {i + 1} (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={manualFb[k]}
                      onChange={(e) => setManualFb((p) => ({ ...p, [k]: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Wat kon beter</Label>
                <Input value={manualFb.wat_kon_beter} onChange={(e) => setManualFb((p) => ({ ...p, wat_kon_beter: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Favoriet onderdeel</Label>
                <Input value={manualFb.favo_onderdeel} onChange={(e) => setManualFb((p) => ({ ...p, favo_onderdeel: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Andere opmerkingen</Label>
                <Input value={manualFb.andere_opmerkingen} onChange={(e) => setManualFb((p) => ({ ...p, andere_opmerkingen: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => setShowManualFb(false)} className="border-slate-200 text-slate-600">
                Annuleren
              </Button>
              <Button
                disabled={!manualReg.email || !emailValid}
                onClick={async () => {
                  const ok = await onAddManualRegistration({
                    ...manualReg,
                    naam: manualReg.naam.trim(),
                  });
                  if (ok) { setShowManualReg(false); setManualReg({ naam: '', email: '', faculteit: '', studiejaar: '' }); }
                }}
                className="bg-[#041c3a] hover:bg-[#041c3a]/90 text-white font-semibold"
              >
                Toevoegen
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}