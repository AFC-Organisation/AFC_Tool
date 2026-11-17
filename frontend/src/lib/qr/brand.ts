export const NAVY = "#081C3C";
export const WHITE = "#FFFFFF";
export const ACCENT = "#EC6525";
export const PAPER = "#F0F2F5";

export const PREVIEW_SIZE = 360;
export const SAMPLE_DATA = "AFC Gent";

export function normalizeHex(value: string): string | null {
  const raw = String(value || "")
    .trim()
    .replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((char) => char + char)
      .join("")}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  return null;
}

export function hexRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex) ?? NAVY;
  return [0, 2, 4].map((offset) => parseInt(h.slice(1 + offset, 3 + offset), 16)) as [
    number,
    number,
    number,
  ];
}

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = hexRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.55;
}

export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function mixHex(a: string, b: string, t: number): string {
  const pa = hexRgb(a);
  const pb = hexRgb(b);
  const mixed = pa.map((channelValue, index) =>
    Math.round(channelValue + (pb[index] - channelValue) * t),
  );
  return `#${mixed.map((n) => n.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}
