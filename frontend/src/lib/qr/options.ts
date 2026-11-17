import QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";
import logoSvg from "@/assets/afc-logo.svg?raw";
import { ACCENT, NAVY, PREVIEW_SIZE, WHITE, contrastRatio, isLight, mixHex } from "./brand";
import {
  bytes,
  exportPixels,
  fit,
  levelName,
  marginPx,
  maxLogoSize,
  minPrintCm,
  modulePx,
  quietModules,
} from "./capacity";
import type { Appearance, EcLevel, QrDrawSettings, ScanReport, StyleId } from "./types";

const STYLES: Record<StyleId, { dots: NonNullable<Options["dotsOptions"]>["type"]; corners: NonNullable<Options["cornersSquareOptions"]>["type"] }> = {
  "extra-rounded": { dots: "extra-rounded", corners: "extra-rounded" },
  rounded: { dots: "rounded", corners: "extra-rounded" },
  classy: { dots: "classy-rounded", corners: "extra-rounded" },
  dots: { dots: "dots", corners: "dot" },
  square: { dots: "square", corners: "square" },
};

const logoCache = new Map<string, string>();

export function resolvedEc(settings: { ec: Appearance["ec"]; logo: boolean }): EcLevel {
  if (settings.ec !== "auto") return settings.ec;
  return settings.logo ? "H" : "Q";
}

export function toDrawSettings(appearance: Appearance, modules?: number): QrDrawSettings {
  return {
    fg: appearance.fg,
    bg: appearance.bg,
    style: appearance.style,
    gradient: appearance.gradient,
    accentEyes: appearance.accentEyes,
    logo: appearance.logo,
    logoSize: appearance.logoSize,
    quiet: appearance.quiet,
    ec: resolvedEc(appearance),
    modules,
    caption: appearance.caption,
    exportSize: appearance.exportSize,
  };
}

export function gradientEnd(fg: string, bg: string): string | null {
  const toward = isLight(bg) ? WHITE : "#000000";
  for (const amount of [0.38, 0.28, 0.18, 0.1]) {
    const candidate = mixHex(fg, toward, amount);
    if (contrastRatio(candidate, bg) >= 4.5) return candidate;
  }
  return null;
}

export function logoForBackground(bg: string): string {
  const ink = isLight(bg) ? NAVY : WHITE;
  const cached = logoCache.get(ink);
  if (cached) return cached;
  const colored = logoSvg
    .replace('<svg width="72" height="30"', '<svg width="1440" height="600"')
    .replace(/#081C3C/gi, ink);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(colored)}`;
  logoCache.set(ink, url);
  return url;
}

export function buildOptions(size: number, data: string, settings: QrDrawSettings): Options {
  const style = STYLES[settings.style] ?? STYLES["extra-rounded"];
  const end = settings.gradient ? gradientEnd(settings.fg, settings.bg) : null;
  const dots: NonNullable<Options["dotsOptions"]> = { type: style.dots };
  if (end) {
    dots.gradient = {
      type: "linear",
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: settings.fg },
        { offset: 1, color: end },
      ],
    };
  } else {
    dots.color = settings.fg;
  }

  const modules = settings.modules || 33;
  const margin = marginPx(size, modules, settings.quiet);
  const level = settings.ec;

  const options: Options = {
    width: size,
    height: size,
    type: "svg",
    data,
    margin,
    qrOptions: {
      typeNumber: 0,
      errorCorrectionLevel: level,
    },
    dotsOptions: dots,
    backgroundOptions: { color: settings.bg },
    cornersSquareOptions: { type: style.corners, color: settings.fg },
    cornersDotOptions: {
      type: style.dots === "square" ? "square" : "dot",
      color: settings.accentEyes ? ACCENT : settings.fg,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: settings.logoSize,
      margin: Math.max(2, Math.round(size * 0.012)),
    },
  };

  if (settings.logo) options.image = logoForBackground(settings.bg);
  return options;
}

export function prepareScan(data: string, requested: Appearance): ScanReport {
  const notes: string[] = [];
  let level: EcLevel = requested.ec === "auto" ? (requested.logo ? "H" : "Q") : requested.ec;
  const fitted = fit(bytes(data), level);
  if (!fitted) return { blocked: "length", notes, settings: null };

  if (fitted.level !== level) {
    notes.push(
      `Foutcorrectie is verlaagd naar ${levelName(fitted.level)}. Op ${levelName(level)} past deze tekst niet.`,
    );
    level = fitted.level;
  }

  let logoSize = requested.logoSize;
  if (requested.logo) {
    const maxSize = maxLogoSize(level, fitted.modules);
    if (logoSize > maxSize + 0.008) {
      notes.push(
        "Het logo is kleiner gezet. Een groot logo dekt bij deze lengte en foutcorrectie te veel vakjes af.",
      );
      logoSize = maxSize;
    }
  }

  if (requested.quiet < 0.055 && quietModules(fitted.modules, requested.quiet) < 3.95) {
    notes.push("De rustzone is vergroot tot 4 vakjes, anders faalt de code op een gekleurde achtergrond.");
  }

  let gradient = requested.gradient;
  if (gradient) {
    const end = gradientEnd(requested.fg, requested.bg);
    if (!end || contrastRatio(end, requested.bg) < 4.5) {
      gradient = false;
      notes.push("Het verloop is uitgezet omdat het de vakjes te licht maakte.");
    }
  }

  let accentEyes = requested.accentEyes;
  if (accentEyes && contrastRatio(ACCENT, requested.bg) < 3) {
    accentEyes = false;
    notes.push("De oranje oogjes zijn uitgezet. Op deze achtergrond zijn ze niet zichtbaar genoeg.");
  }

  const exportSize = exportPixels(fitted.modules, requested.exportSize);
  if (exportSize > requested.exportSize + 8) {
    notes.push(
      `Het bestand wordt op ${exportSize} px gemaakt, anders zijn de vakjes te klein voor een telefoon.`,
    );
  }

  const ratio = contrastRatio(requested.fg, requested.bg);
  const previewMargin = marginPx(PREVIEW_SIZE, fitted.modules, requested.quiet);
  const previewTooSmall = modulePx(PREVIEW_SIZE, previewMargin, fitted.modules) < 8;
  const minCm = minPrintCm(fitted.modules);

  return {
    blocked: ratio < 3 ? "contrast" : null,
    notes,
    previewTooSmall,
    minCm: minCm >= 8 ? minCm : 0,
    settings: {
      ...toDrawSettings(requested),
      ec: level,
      logoSize,
      gradient,
      accentEyes,
      modules: fitted.modules,
      exportSize,
    },
  };
}

export function createStyledQr(size: number, data: string, settings: QrDrawSettings): QRCodeStyling {
  return new QRCodeStyling(buildOptions(size, data, settings));
}
