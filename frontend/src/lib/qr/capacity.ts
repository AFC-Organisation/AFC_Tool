import type { EcLevel } from "./types";

const BYTE_CAPACITY: Record<EcLevel, number[]> = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2956],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273],
};

const EC_FRACTION: Record<EcLevel, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
const LEVELS: EcLevel[] = ["L", "M", "Q", "H"];
const LEVEL_NAME: Record<EcLevel, string> = {
  L: "laag",
  M: "midden",
  Q: "hoog",
  H: "maximum",
};

export function levelName(level: EcLevel): string {
  return LEVEL_NAME[level] || level;
}

export function nextLevelDown(level: EcLevel): EcLevel | null {
  const index = LEVELS.indexOf(level);
  return index > 0 ? LEVELS[index - 1] : null;
}

export function bytes(text: string): number {
  return new TextEncoder().encode(String(text || "")).length;
}

function versionFor(byteLength: number, level: EcLevel): number {
  const table = BYTE_CAPACITY[level];
  if (!table) return 0;
  for (let index = 0; index < table.length; index += 1) {
    if (table[index] >= byteLength) return index + 1;
  }
  return 0;
}

function modulesFor(version: number): number {
  return 21 + (version - 1) * 4;
}

export function fit(
  byteLength: number,
  preferred: EcLevel,
): { level: EcLevel; version: number; modules: number } | null {
  const start = LEVELS.indexOf(preferred);
  const order = (start < 0 ? LEVELS : LEVELS.slice(0, start + 1)).slice().reverse();
  for (const level of order) {
    const version = versionFor(byteLength, level);
    if (version) return { level, version, modules: modulesFor(version) };
  }
  return null;
}

function maxCoverage(modules: number): number {
  if (modules <= 33) return 0.15;
  if (modules >= 69) return 0.095;
  const t = (modules - 33) / (69 - 33);
  return 0.15 - t * 0.055;
}

export function maxLogoSize(level: EcLevel, modules: number): number {
  const fraction = EC_FRACTION[level] || 0.3;
  return Math.min(0.62, maxCoverage(modules) / fraction);
}

export function quietModules(modules: number, fraction: number): number {
  const f = Math.min(0.2, Math.max(0, Number(fraction) || 0));
  return (f * modules) / (1 - 2 * f);
}

export function marginPx(size: number, modules: number, fraction: number): number {
  const minMargin = Math.ceil((4 * size) / (modules + 8));
  const wanted = Math.round(size * (Number(fraction) || 0));
  return Math.max(minMargin, wanted);
}

export function modulePx(size: number, margin: number, modules: number): number {
  return (size - 2 * margin) / modules;
}

export function exportPixels(modules: number, selected: number): number {
  const needed = (modules + 8) * 12;
  return Math.min(3072, Math.max(selected, Math.ceil(needed)));
}

export function minPrintCm(modules: number): number {
  return Math.max(3, Math.ceil(modules * 0.12));
}
