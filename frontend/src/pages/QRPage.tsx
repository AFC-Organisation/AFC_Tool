import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTicketTailorEvents } from "@/hooks/useTicketTailorEvents";
import { cn } from "@/lib/utils";
import { PREVIEW_SIZE, SAMPLE_DATA, contrastRatio, isLight, normalizeHex } from "@/lib/qr/brand";
import { exportQr, type ExportExt } from "@/lib/qr/exportQr";
import { createStyledQr, prepareScan, resolvedEc, toDrawSettings } from "@/lib/qr/options";
import {
  readPayload,
  ticketTailorEventLink,
  type Kind,
  type PayloadFields,
} from "@/lib/qr/payload";
import {
  DEFAULT_APPEARANCE,
  EC_OPTIONS,
  EXPORT_SIZES,
  PRESETS,
  STYLE_OPTIONS,
  loadSettings,
  saveSettings,
} from "@/lib/qr/settings";
import type { Appearance, QrDrawSettings } from "@/lib/qr/types";
import { levelName } from "@/lib/qr/capacity";
import { logoSizeName, scanSentence, verifyCode } from "@/lib/qr/verify";
import type { TicketTailorEvent } from "@/types/tickettailor";

const EMPTY_FIELDS: PayloadFields = {
  url: "",
  phone: "",
  email: "",
  emailSubject: "",
  emailBody: "",
  ticketTailorEventId: "",
};

const KINDS: { id: Kind; label: string }[] = [
  { id: "url", label: "Link" },
  { id: "phone", label: "Telefoon" },
  { id: "email", label: "E-mail" },
  { id: "event", label: "Event" },
  { id: "workshop", label: "Workshop" },
  { id: "project", label: "Project" },
  { id: "tickettailor", label: "TicketTailor" },
];

type Tone = "ok" | "warn" | "muted" | "hint" | "error";

type ScanUi = {
  key: string;
  phase: "idle" | "ok" | "fail";
  notes: string[];
  redrew: boolean;
  settings: QrDrawSettings | null;
};

const controlClass =
  "h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm text-[#081C3C] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function toneClass(tone: Tone) {
  if (tone === "ok") return "text-emerald-700";
  if (tone === "error") return "text-red-600";
  if (tone === "warn") return "text-amber-800";
  return "text-slate-500";
}

function contrastStatus(fg: string, bg: string): { text: string; tone: Tone } {
  const ratio = contrastRatio(fg, bg);
  if (ratio < 3) {
    return { text: "Dit contrast is te laag. Een telefoon kan de code missen.", tone: "warn" };
  }
  if (ratio < 4.5) {
    return {
      text: "Het contrast is krap. Test de code met een telefoon voor je hem afdrukt.",
      tone: "warn",
    };
  }
  return { text: "Contrast is goed om te scannen.", tone: "ok" };
}

function HexColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const shown = focused ? draft : value;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-white px-2">
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          aria-label={value}
          value={shown}
          spellCheck={false}
          onFocus={() => {
            setDraft(value);
            setFocused(true);
          }}
          onChange={(event) => {
            const next = event.target.value.toUpperCase();
            setDraft(next);
            const hex = normalizeHex(next);
            if (hex) onChange(hex);
          }}
          onBlur={() => {
            const hex = normalizeHex(draft);
            if (hex) onChange(hex);
            setFocused(false);
          }}
          className="w-full bg-transparent font-mono text-sm text-[#081C3C] outline-none"
        />
      </div>
    </div>
  );
}

function formatTtOptionLabel(event: TicketTailorEvent) {
  const date = event.start?.date
    ? new Intl.DateTimeFormat("nl-BE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(event.start.iso || `${event.start.date}T12:00:00`))
    : null;
  return date ? `${event.name} · ${date}` : event.name;
}

export default function QRPage() {
  const [kind, setKind] = useState<Kind>(() => loadSettings()?.kind ?? "url");
  const [fields, setFields] = useState<PayloadFields>(EMPTY_FIELDS);
  const [appearance, setAppearance] = useState<Appearance>(
    () => loadSettings()?.appearance ?? DEFAULT_APPEARANCE,
  );
  const [scan, setScan] = useState<ScanUi>({
    key: "",
    phase: "idle",
    notes: [],
    redrew: false,
    settings: null,
  });
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ tone: Tone; text: string } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const ttEnabled = kind === "tickettailor";
  const {
    events: ttEvents,
    loading: ttLoading,
    error: ttError,
    refetch: refetchTt,
  } = useTicketTailorEvents(ttEnabled);

  const publishedTtEvents = useMemo(
    () => ttEvents.filter((event) => event.status === "published"),
    [ttEvents],
  );

  // Houd selectie in sync als het event niet meer published is / geen link heeft.
  useEffect(() => {
    if (!ttEnabled || ttLoading || !fields.ticketTailorEventId) return;
    const selected = publishedTtEvents.find(
      (event) => event.id === fields.ticketTailorEventId,
    );
    if (!selected) {
      setFields((current) => ({
        ...current,
        ticketTailorEventId: "",
        url: "",
      }));
      return;
    }
    const link = ticketTailorEventLink(selected);
    if (link && link !== fields.url) {
      setFields((current) => ({ ...current, url: link }));
    }
  }, [
    ttEnabled,
    ttLoading,
    publishedTtEvents,
    fields.ticketTailorEventId,
    fields.url,
  ]);

  useEffect(() => {
    const id = "afc-josefin-sans";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    saveSettings(kind, appearance);
  }, [kind, appearance]);

  const derived = useMemo(() => {
    const payload = readPayload(kind, fields);
    const report = payload.ok ? prepareScan(payload.value, appearance) : null;
    const lengthBlocked = report?.blocked === "length";
    const previewData = payload.ok && !lengthBlocked ? payload.value : SAMPLE_DATA;
    const previewSettings =
      payload.ok && report?.settings && !lengthBlocked ? report.settings : toDrawSettings(appearance);
    return { payload, report, lengthBlocked, previewData, previewSettings };
  }, [kind, fields, appearance]);

  const inputKey = useMemo(
    () => JSON.stringify({ kind, fields, appearance }),
    [kind, fields, appearance],
  );

  const scanMatches = scan.key === inputKey;
  const exportSettings = scanMatches && scan.phase === "ok" ? scan.settings : null;
  const drawSettings =
    scanMatches && scan.phase === "ok" && scan.redrew && scan.settings
      ? scan.settings
      : derived.previewSettings;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.replaceChildren();
    try {
      createStyledQr(PREVIEW_SIZE, derived.previewData, drawSettings).append(frame);
    } catch {
      frame.replaceChildren();
    }
  }, [derived.previewData, drawSettings]);

  useEffect(() => {
    const report = derived.report;
    if (!derived.payload.ok || !report || report.blocked || !report.settings) {
      return;
    }
    const data = derived.payload.value;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void verifyCode(data, report, () => cancelled).then((result) => {
        if (cancelled || !result) return;
        if (result.ok) {
          setScan({
            key: inputKey,
            phase: "ok",
            notes: result.notes,
            redrew: result.redrew,
            settings: result.settings,
          });
          return;
        }
        setScan({
          key: inputKey,
          phase: "fail",
          notes: result.notes,
          redrew: false,
          settings: null,
        });
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [derived, inputKey]);

  const activePayload =
    derived.payload.ok && derived.report && !derived.report.blocked ? derived.payload.value : "";
  const canExport = Boolean(activePayload && exportSettings && !exporting);
  const showSample = !derived.payload.ok || derived.lengthBlocked;
  const awaitingScan =
    derived.payload.ok && derived.report?.blocked === null && !scanMatches;

  const activeLevel =
    (scanMatches && scan.phase === "ok" && scan.settings
      ? scan.settings.ec
      : derived.report?.settings?.ec) ?? resolvedEc(appearance);
  const shownLogo = derived.report?.settings?.logoSize ?? appearance.logoSize;
  const logoLimited = Boolean(
    derived.report?.settings?.logo && shownLogo + 0.008 < appearance.logoSize,
  );
  const contrast = contrastStatus(appearance.fg, appearance.bg);

  let scanText = "";
  let scanTone: Tone = "muted";
  if (derived.lengthBlocked) {
    scanText = "Deze inhoud is te lang voor een QR-code. Maak ze korter.";
    scanTone = "warn";
  } else if (derived.report?.blocked === "contrast") {
    scanText = scanSentence(derived.report);
    scanTone = "warn";
  } else if (awaitingScan) {
    scanText = "Controleren of een telefoon dit kan lezen…";
    scanTone = "muted";
  } else if (scanMatches && scan.phase === "ok" && derived.report && derived.report.blocked !== "length") {
    scanText = scanSentence(derived.report, scan.notes);
    const notes = derived.report.blocked === null ? derived.report.notes : [];
    scanTone = notes.length || scan.notes.length ? "warn" : "ok";
  } else if (scanMatches && scan.phase === "fail" && derived.report && derived.report.blocked !== "length") {
    scanText = scanSentence({ ...derived.report, blocked: "unreadable" }, scan.notes);
    scanTone = "warn";
  }

  const fieldMessage = derived.payload.ok ? derived.payload.hint : derived.payload.message;
  const fieldTone: Tone = derived.payload.ok ? "ok" : derived.payload.empty ? "hint" : "error";

  function patchAppearance(patch: Partial<Appearance>) {
    setAppearance((current) => ({ ...current, ...patch }));
  }

  function patchFields(patch: Partial<PayloadFields>) {
    setFields((current) => ({ ...current, ...patch }));
  }

  function onSelectTicketTailorEvent(eventId: string) {
    if (!eventId) {
      patchFields({ ticketTailorEventId: "", url: "" });
      return;
    }
    const event = publishedTtEvents.find((item) => item.id === eventId);
    if (!event) {
      patchFields({ ticketTailorEventId: "", url: "" });
      return;
    }
    const link = ticketTailorEventLink(event);
    patchFields({
      ticketTailorEventId: event.id,
      url: link ?? "",
    });
    if (!appearance.caption.trim()) {
      patchAppearance({ caption: event.name.slice(0, 60) });
    }
  }

  async function onExport(ext: ExportExt) {
    if (!activePayload || !exportSettings || exporting) return;
    setExporting(true);
    setExportStatus({ tone: "muted", text: "Bezig met exporteren…" });
    try {
      await exportQr(ext, kind, activePayload, exportSettings);
      setExportStatus({ tone: "ok", text: "Het bestand is gedownload." });
    } catch {
      setExportStatus({
        tone: "warn",
        text: "Exporteren is niet gelukt. Probeer een kortere tekst of een andere kleur.",
      });
    } finally {
      setExporting(false);
    }
  }

  async function onCopy() {
    if (!activePayload || exporting) return;
    try {
      await navigator.clipboard.writeText(activePayload);
      setExportStatus({ tone: "ok", text: "De inhoud staat op het klembord." });
    } catch {
      setExportStatus({
        tone: "warn",
        text: "Kopiëren lukt niet in deze browser. Selecteer de tekst hierboven.",
      });
    }
  }

  return (
    <AppLayout
      title="QR Generator"
      subtitle="QR-codes maken volgens de AFC-huisstijl"
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] print:block">
        <div className="flex flex-col gap-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#081C3C]">Inhoud</CardTitle>
              <CardDescription>Kies wat de QR-code moet doen.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div role="group" aria-label="Type QR-code" className="flex flex-wrap gap-2">
                {KINDS.map((item) => {
                  const selected = kind === item.id;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      aria-pressed={selected}
                      onClick={() => setKind(item.id)}
                      className={cn(
                        "rounded-full px-4",
                        selected
                          ? "border-[#081C3C] bg-[#081C3C] text-white hover:bg-[#081C3C] hover:text-white"
                          : "bg-white text-[#081C3C]",
                      )}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              {kind === "url" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="qr-url">Link</Label>
                  <Input
                    id="qr-url"
                    value={fields.url}
                    placeholder="https://"
                    onChange={(event) => patchFields({ url: event.target.value })}
                  />
                </div>
              )}

              {kind === "phone" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="qr-phone">Telefoonnummer</Label>
                  <Input
                    id="qr-phone"
                    type="tel"
                    value={fields.phone}
                    placeholder="0470 12 34 56"
                    onChange={(event) => patchFields({ phone: event.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Begint het nummer met 0, dan wordt het een Belgisch nummer (+32).
                  </p>
                </div>
              )}

              {kind === "email" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="qr-email">E-mailadres</Label>
                    <Input
                      id="qr-email"
                      type="email"
                      value={fields.email}
                      placeholder="naam@voorbeeld.be"
                      onChange={(event) => patchFields({ email: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="qr-subject">Onderwerp optioneel</Label>
                    <Input
                      id="qr-subject"
                      value={fields.emailSubject}
                      onChange={(event) => patchFields({ emailSubject: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="qr-body">Bericht optioneel</Label>
                    <Textarea
                      id="qr-body"
                      value={fields.emailBody}
                      rows={3}
                      onChange={(event) => patchFields({ emailBody: event.target.value })}
                    />
                  </div>
                </div>
              )}

              {kind === "tickettailor" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="qr-tt-event">Gepubliceerd event</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={ttLoading}
                        onClick={() => void refetchTt()}
                        className="text-slate-500"
                      >
                        Vernieuwen
                      </Button>
                    </div>
                    <select
                      id="qr-tt-event"
                      className={controlClass}
                      value={fields.ticketTailorEventId}
                      disabled={ttLoading || Boolean(ttError)}
                      onChange={(event) => onSelectTicketTailorEvent(event.target.value)}
                    >
                      <option value="">
                        {ttLoading
                          ? "Events laden…"
                          : publishedTtEvents.length === 0
                            ? "Geen published events"
                            : "Kies een event…"}
                      </option>
                      {publishedTtEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {formatTtOptionLabel(event)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {ttError && (
                    <p className={cn("text-sm", toneClass("error"))}>{ttError}</p>
                  )}

                  {!ttError && !ttLoading && publishedTtEvents.length === 0 && (
                    <p className={cn("text-sm", toneClass("hint"))}>
                      Er zijn geen events met status Published in TicketTailor.
                    </p>
                  )}

                  {fields.ticketTailorEventId && fields.url && (
                    <p className="text-xs break-all text-slate-500">
                      QR-link: {fields.url}
                    </p>
                  )}

                  <p className={cn("text-sm", toneClass(fieldTone))}>{fieldMessage}</p>
                </div>
              )}

              {kind === "event" && (
                <p className={cn("text-sm", toneClass(fieldTone))}>
                  Van zodra de ticketing geïmplementeerd wordt, kun je hier automatisch een QR-code
                  genereren voor events.
                </p>
              )}
              {kind === "project" && (
                <p className={cn("text-sm", toneClass(fieldTone))}>
                  Van zodra de ticketing geïmplementeerd wordt, kun je hier automatisch een QR-code
                  genereren voor projects.
                </p>
              )}
              {kind === "workshop" && (
                <p className={cn("text-sm", toneClass(fieldTone))}>
                  Van zodra de ticketing geïmplementeerd wordt, kun je hier automatisch een QR-code
                  genereren voor workshops.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#081C3C]">Uiterlijk</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div role="group" aria-label="Huisstijl" className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const selected = preset.fg === appearance.fg && preset.bg === appearance.bg;
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant="outline"
                      aria-pressed={selected}
                      onClick={() => patchAppearance({ fg: preset.fg, bg: preset.bg })}
                      className={cn(
                        "rounded-full px-4",
                        selected
                          ? "border-[#081C3C] bg-[#081C3C] text-white hover:bg-[#081C3C] hover:text-white"
                          : "bg-white text-[#081C3C]",
                      )}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <HexColorField
                  label="Kleur van de code"
                  value={appearance.fg}
                  onChange={(fg) => patchAppearance({ fg })}
                />
                <HexColorField
                  label="Achtergrond"
                  value={appearance.bg}
                  onChange={(bg) => patchAppearance({ bg })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-style">Stijl</Label>
                <select
                  id="qr-style"
                  className={controlClass}
                  value={appearance.style}
                  onChange={(event) =>
                    patchAppearance({ style: event.target.value as Appearance["style"] })
                  }
                >
                  {STYLE_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2 text-sm text-[#081C3C]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#081C3C]"
                  checked={appearance.gradient}
                  onChange={(event) => patchAppearance({ gradient: event.target.checked })}
                />
                Zacht verloop (gradient kleurwisseling)
              </label>
              <label className="flex items-start gap-2 text-sm text-[#081C3C]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#081C3C]"
                  checked={appearance.accentEyes}
                  onChange={(event) => patchAppearance({ accentEyes: event.target.checked })}
                />
                Oranje oogjes (in de hoeken)
              </label>
              <label className="flex items-start gap-2 text-sm text-[#081C3C]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#081C3C]"
                  checked={appearance.logo}
                  onChange={(event) => patchAppearance({ logo: event.target.checked })}
                />
                AFC-logo (in het midden)
              </label>
              <p className="text-xs leading-relaxed text-slate-500">
                Lichte achtergrond → logo donkerblauw
                <br />
                Donkere achtergrond → logo wit
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="qr-logo-size">Grootte van het logo</Label>
                    <span className="text-slate-500">
                      {logoSizeName(appearance.logoSize)}
                      {logoLimited ? ", begrensd" : ""}
                    </span>
                  </div>
                  <input
                    id="qr-logo-size"
                    type="range"
                    min={0.3}
                    max={0.62}
                    step={0.01}
                    disabled={!appearance.logo}
                    value={appearance.logoSize}
                    onChange={(event) => patchAppearance({ logoSize: Number(event.target.value) })}
                    className="accent-[#081C3C] disabled:opacity-40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="qr-quiet">Rustzone</Label>
                    <span className="text-slate-500">{Math.round(appearance.quiet * 100)}%</span>
                  </div>
                  <input
                    id="qr-quiet"
                    type="range"
                    min={0.02}
                    max={0.12}
                    step={0.005}
                    value={appearance.quiet}
                    onChange={(event) => patchAppearance({ quiet: Number(event.target.value) })}
                    className="accent-[#081C3C]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-ec">Foutcorrectie</Label>
                <select
                  id="qr-ec"
                  className={controlClass}
                  value={appearance.ec}
                  onChange={(event) =>
                    patchAppearance({ ec: event.target.value as Appearance["ec"] })
                  }
                >
                  {EC_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Nu actief: {levelName(activeLevel)}.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6 print:static print:bg-transparent print:ring-0">
          <CardHeader className="print:hidden">
            <CardTitle className="text-lg font-semibold text-[#081C3C]">Resultaat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              id="qr-print-sheet"
              className={cn(
                "relative rounded-2xl border border-black/5 p-4",
                showSample && "pt-8",
              )}
              style={{ background: appearance.bg }}
            >
              {showSample && (
                <span className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#EC6525] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  VOORBEELD
                </span>
              )}
              <div
                ref={frameRef}
                className="mx-auto aspect-square w-full max-w-[360px] [&_svg]:h-full [&_svg]:w-full"
              />
              {appearance.caption && (
                <p
                  className="mt-2 text-center text-sm font-bold"
                  style={{ color: isLight(appearance.bg) ? "#081C3C" : "#FFFFFF" }}
                >
                  {appearance.caption}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 print:hidden">
              <p className={cn("text-sm", toneClass(contrast.tone))}>{contrast.text}</p>
              <p className="text-sm text-slate-500">
                {appearance.logo
                  ? `Logo past zich aan: ${isLight(appearance.bg) ? "donkerblauw" : "wit"}, op basis van de achtergrond.`
                  : "Het logo staat uit."}
              </p>
              {scanText && <p className={cn("text-sm", toneClass(scanTone))}>{scanText}</p>}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-caption">Tekst onder de code optioneel</Label>
                <Input
                  id="qr-caption"
                  maxLength={60}
                  value={appearance.caption}
                  placeholder="Bijvoorbeeld de naam van het event"
                  onChange={(event) => patchAppearance({ caption: event.target.value.slice(0, 60) })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#081C3C]">Inhoud van de code (doublecheck)</h3>
                <Button type="button" variant="outline" size="sm" disabled={!activePayload || exporting} onClick={onCopy}>
                  Kopieer
                </Button>
              </div>
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm break-all text-slate-600">
                {derived.payload.ok
                  ? derived.payload.value
                  : "Nog geen geldige inhoud. De code hierboven is een voorbeeld."}
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-size">Resolutie</Label>
                <select
                  id="qr-size"
                  className={controlClass}
                  value={appearance.exportSize}
                  onChange={(event) =>
                    patchAppearance({ exportSize: Number(event.target.value) as Appearance["exportSize"] })
                  }
                >
                  {EXPORT_SIZES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                Om een export te doen, kies je een formaat. Je kunt altijd een png/jpg file plakken in
                PowerPoint/Canva/...
              </p>

              <div className="flex flex-wrap gap-2">
                {(["png", "jpg", "webp", "svg", "pdf"] as ExportExt[]).map((ext) => (
                  <Button
                    key={ext}
                    type="button"
                    variant="outline"
                    disabled={!canExport}
                    onClick={() => void onExport(ext)}
                    className="min-w-16 rounded-full bg-white uppercase"
                  >
                    {ext}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canExport}
                  onClick={() => window.print()}
                  className="rounded-full bg-white"
                >
                  Afdrukken
                </Button>
              </div>
              {exportStatus && <p className={cn("text-sm", toneClass(exportStatus.tone))}>{exportStatus.text}</p>}
              <p className="text-xs leading-relaxed text-slate-500">
                Alle data die je hier intypt blijft lokaal in je browser, er wordt niks naar de server/IT gestuurd ;)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
