export type EcLevel = "L" | "M" | "Q" | "H";
export type EcChoice = "auto" | EcLevel;
export type StyleId = "extra-rounded" | "rounded" | "classy" | "dots" | "square";
export type ExportSize = 1024 | 2048 | 3072;

export type Appearance = {
  fg: string;
  bg: string;
  style: StyleId;
  gradient: boolean;
  accentEyes: boolean;
  logo: boolean;
  logoSize: number;
  quiet: number;
  ec: EcChoice;
  exportSize: ExportSize;
  caption: string;
};

export type QrDrawSettings = {
  fg: string;
  bg: string;
  style: StyleId;
  gradient: boolean;
  accentEyes: boolean;
  logo: boolean;
  logoSize: number;
  quiet: number;
  ec: EcLevel;
  modules?: number;
  caption: string;
  exportSize: number;
};

export type ScanReport =
  | { blocked: "length"; notes: string[]; settings: null }
  | {
      blocked: "contrast" | null;
      notes: string[];
      previewTooSmall: boolean;
      minCm: number;
      settings: QrDrawSettings;
    };
