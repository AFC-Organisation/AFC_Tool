import { NAVY, WHITE, normalizeHex } from "./brand";
import type { Kind } from "./payload";
import type { Appearance, EcChoice, ExportSize, StyleId } from "./types";

export const STORE_KEY = "afc-qr-generator";

export const PRESETS = [
  { id: "licht", label: "AFC licht", fg: NAVY, bg: WHITE },
  { id: "donker", label: "AFC donker", fg: WHITE, bg: NAVY },
  { id: "oranje", label: "Oranje", fg: "#EC6525", bg: WHITE },
  { id: "papier", label: "Papier", fg: NAVY, bg: "#F0F2F5" },
] as const;

export const STYLE_OPTIONS: { id: StyleId; label: string }[] = [
  { id: "extra-rounded", label: "Extra rond" },
  { id: "rounded", label: "Rond" },
  { id: "classy", label: "Classy" },
  { id: "dots", label: "Stippen" },
  { id: "square", label: "Strak" },
];

export const EC_OPTIONS: { id: EcChoice; label: string }[] = [
  { id: "auto", label: "Automatisch" },
  { id: "L", label: "Laag" },
  { id: "M", label: "Midden" },
  { id: "Q", label: "Hoog" },
  { id: "H", label: "Maximum" },
];

export const EXPORT_SIZES: { id: ExportSize; label: string }[] = [
  { id: 1024, label: "1024 px · scherm" },
  { id: 2048, label: "2048 px · print" },
  { id: 3072, label: "3072 px · poster" },
];

const STYLES = new Set<StyleId>(STYLE_OPTIONS.map((item) => item.id));
const LEVELS = new Set<EcChoice>(EC_OPTIONS.map((item) => item.id));
const KINDS = new Set<Kind>(["url", "phone", "email"]);

export const DEFAULT_APPEARANCE: Appearance = {
  fg: NAVY,
  bg: WHITE,
  style: "extra-rounded",
  gradient: true,
  accentEyes: true,
  logo: true,
  logoSize: 0.48,
  quiet: 0.06,
  ec: "auto",
  exportSize: 2048,
  caption: "",
};

export function loadSettings(): { kind: Kind; appearance: Appearance } | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Appearance> & { kind?: string };
    const appearance: Appearance = { ...DEFAULT_APPEARANCE };
    const fg = normalizeHex(String(data.fg ?? ""));
    const bg = normalizeHex(String(data.bg ?? ""));
    if (fg) appearance.fg = fg;
    if (bg) appearance.bg = bg;
    if (STYLES.has(data.style as StyleId)) appearance.style = data.style as StyleId;
    appearance.gradient = Boolean(data.gradient);
    appearance.accentEyes = data.accentEyes !== false;
    appearance.logo = data.logo !== false;
    if (Number.isFinite(data.logoSize)) appearance.logoSize = Number(data.logoSize);
    if (Number.isFinite(data.quiet)) appearance.quiet = Number(data.quiet);
    if (LEVELS.has(data.ec as EcChoice)) appearance.ec = data.ec as EcChoice;
    if ([1024, 2048, 3072].includes(Number(data.exportSize))) {
      appearance.exportSize = Number(data.exportSize) as ExportSize;
    }
    if (typeof data.caption === "string") appearance.caption = data.caption.slice(0, 60);
    const kind = KINDS.has(data.kind as Kind) ? (data.kind as Kind) : "url";
    return { kind, appearance };
  } catch {
    return null;
  }
}

export function saveSettings(kind: Kind, appearance: Appearance) {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        kind,
        fg: appearance.fg,
        bg: appearance.bg,
        style: appearance.style,
        gradient: appearance.gradient,
        accentEyes: appearance.accentEyes,
        logo: appearance.logo,
        logoSize: appearance.logoSize,
        quiet: appearance.quiet,
        ec: appearance.ec,
        exportSize: appearance.exportSize,
        caption: appearance.caption,
      }),
    );
  } catch {
    /* De pagina werkt ook als de browser niets bewaart. */
  }
}
