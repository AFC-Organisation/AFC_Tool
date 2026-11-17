import jsQR from "jsqr";
import { bytes, fit, levelName, maxLogoSize, nextLevelDown } from "./capacity";
import { createStyledQr } from "./options";
import type { QrDrawSettings, ScanReport, StyleId } from "./types";

const LOGO_NOTE =
  "Het logo is kleiner gezet. Een groot logo dekt bij deze lengte en foutcorrectie te veel vakjes af.";

export type VerifyResult =
  | { ok: true; settings: QrDrawSettings; notes: string[]; redrew: boolean }
  | { ok: false; notes: string[] };

function asBlob(value: unknown): Blob | null {
  return value instanceof Blob ? value : null;
}

function drawToCanvas(bitmap: ImageBitmap, box: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = box;
  canvas.height = box;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, box, box);
  ctx.drawImage(bitmap, 0, 0, box, box);
  return canvas;
}

async function reads(blob: Blob, expected: string): Promise<boolean> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = drawToCanvas(bitmap, bitmap.width);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(image.data, canvas.width, canvas.height, {
      inversionAttempts: "attemptBoth",
    });
    return result?.data === expected;
  } finally {
    bitmap.close();
  }
}

function relaxScan(
  settings: QrDrawSettings,
  data: string,
  step: "eyes" | "gradient" | "square" | "logo" | "level",
): { settings: QrDrawSettings; note: string } | null {
  if (step === "eyes" && settings.accentEyes) {
    return { settings: { ...settings, accentEyes: false }, note: "De oranje oogjes zijn uitgezet." };
  }
  if (step === "gradient" && settings.gradient) {
    return { settings: { ...settings, gradient: false }, note: "Het verloop is uitgezet." };
  }
  if (step === "square" && settings.style !== "square") {
    return {
      settings: { ...settings, style: "square" satisfies StyleId },
      note: "De vakjes zijn vierkant gezet. Ronde vakjes worden bij een fijne code te klein.",
    };
  }
  if (step === "logo" && settings.logo) {
    return {
      settings: { ...settings, logo: false },
      note: "Het logo is uitgezet. Het dekte te veel van de code af.",
    };
  }
  if (step === "level") {
    const lower = nextLevelDown(settings.ec);
    if (!lower) return null;
    const fitted = fit(bytes(data), lower);
    if (!fitted) return null;
    return {
      settings: { ...settings, ec: lower, modules: fitted.modules },
      note: `Foutcorrectie is verlaagd naar ${levelName(lower)} omdat de code anders te fijn is.`,
    };
  }
  return null;
}

export async function verifyCode(
  data: string,
  report: Extract<ScanReport, { blocked: "contrast" | null }>,
  isCancelled: () => boolean,
): Promise<VerifyResult | null> {
  if (!report.settings) return { ok: false, notes: [] };

  let current = report.settings;
  const extraNotes: string[] = [];
  const steps = ["eyes", "gradient", "square", "logo", "level"] as const;
  const modulePixels = [12, 16, 10];

  for (let attempt = 0; attempt <= steps.length; attempt += 1) {
    let readable = false;
    for (let index = 0; index < modulePixels.length; index += 1) {
      const size = ((current.modules || 33) + 8) * modulePixels[index];
      let blob: Blob | null = null;
      try {
        const probe = createStyledQr(size, data, current);
        if (index === 0) {
          const actual = probe._qr?.getModuleCount() ?? current.modules ?? 33;
          if (actual > (current.modules || 33) + 1 && current.logo) {
            const capped = Math.min(current.logoSize, maxLogoSize(current.ec, actual));
            if (
              capped + 0.008 < current.logoSize &&
              !report.notes.includes(LOGO_NOTE) &&
              !extraNotes.includes(LOGO_NOTE)
            ) {
              extraNotes.push(LOGO_NOTE);
            }
            current = { ...current, modules: actual, logoSize: capped };
          }
        }
        blob = asBlob(await createStyledQr(size, data, current).getRawData("png"));
      } catch {
        blob = null;
      }
      if (isCancelled()) return null;
      readable = blob ? await reads(blob, data) : false;
      if (isCancelled()) return null;
      if (readable) break;
    }

    if (readable) {
      return { ok: true, settings: current, notes: extraNotes, redrew: attempt > 0 };
    }

    const next = attempt < steps.length ? relaxScan(current, data, steps[attempt]) : null;
    if (!next) continue;
    current = next.settings;
    extraNotes.push(next.note);
  }

  return { ok: false, notes: extraNotes };
}

export function scanSentence(
  report: { blocked?: "length" | "contrast" | "unreadable" | null; notes?: string[]; previewTooSmall?: boolean; minCm?: number } | null,
  extraNotes: string[] = [],
): string {
  if (!report) return "";
  if (report.blocked === "length") return "Deze inhoud is te lang voor een QR-code. Maak ze korter.";
  if (report.blocked === "contrast") {
    return "Deze kleuren liggen te dicht bij elkaar voor een telefooncamera. Kies een duidelijk donkere code op een lichte achtergrond, of omgekeerd.";
  }
  if (report.blocked === "unreadable") {
    return "Een telefoon kan deze combinatie niet lezen. Zet het logo uit of kies kleuren die verder uit elkaar liggen.";
  }
  const notes = (report.notes ?? []).concat(extraNotes);
  const lines: string[] = [];
  if (notes.length) lines.push(notes.join(" "));
  lines.push("Een telefoon kan deze code lezen.");
  if (report.previewTooSmall) lines.push("Scan het gedownloade bestand, niet dit kleine voorbeeld.");
  if (report.minCm) lines.push(`Toon de code minstens ${report.minCm} cm breed, of schermvullend.`);
  return lines.join(" ");
}

export function logoSizeName(value: number): string {
  if (value < 0.4) return "Klein";
  if (value < 0.52) return "Normaal";
  return "Groot";
}
