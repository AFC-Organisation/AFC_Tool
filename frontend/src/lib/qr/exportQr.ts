import { jsPDF } from "jspdf";
import { NAVY, WHITE, isLight } from "./brand";
import { createStyledQr } from "./options";
import type { Kind } from "./payload";
import type { QrDrawSettings } from "./types";

function asBlob(value: unknown): Blob | null {
  return value instanceof Blob ? value : null;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Het beeld kon niet gemaakt worden."));
    };
    image.src = url;
  });
}

async function composeRaster(pngBlob: Blob, settings: QrDrawSettings, mime: string): Promise<Blob> {
  const image = await blobToImage(pngBlob);
  const caption = settings.caption;
  const extra = caption ? Math.round(image.width * 0.16) : 0;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height + extra;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("leeg");
  ctx.fillStyle = settings.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  if (caption) {
    ctx.fillStyle = isLight(settings.bg) ? NAVY : WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = Math.round(image.width * 0.048);
    do {
      ctx.font = `700 ${size}px "Josefin Sans", sans-serif`;
      if (ctx.measureText(caption).width <= image.width * 0.86 || size <= 18) break;
      size -= 2;
    } while (size > 18);
    ctx.fillText(caption, image.width / 2, image.height + extra * 0.45);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.95));
  if (!blob) throw new Error("Dit bestandsformaat wordt door de browser niet ondersteund.");
  return blob;
}

function captionedSvg(svgText: string, settings: QrDrawSettings): Blob {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  const width = Number(svg.getAttribute("width"));
  const height = Number(svg.getAttribute("height"));
  const extra = Math.round(height * 0.16);
  svg.setAttribute("height", String(height + extra));
  svg.setAttribute("viewBox", `0 0 ${width} ${height + extra}`);
  const text = doc.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(width / 2));
  text.setAttribute("y", String(height + extra * 0.48));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-family", "Josefin Sans, sans-serif");
  text.setAttribute("font-weight", "700");
  text.setAttribute("font-size", String(Math.round(width * 0.048)));
  text.setAttribute("fill", isLight(settings.bg) ? NAVY : WHITE);
  text.textContent = settings.caption;
  return new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("pdf"));
    reader.readAsDataURL(blob);
  });
}

export type ExportExt = "png" | "jpg" | "webp" | "svg" | "pdf";

export async function exportQr(ext: ExportExt, kind: Kind, payload: string, settings: QrDrawSettings) {
  await document.fonts.ready;
  const qr = createStyledQr(settings.exportSize, payload, settings);
  const filename = `afc-qr-${kind}`;

  if (ext === "svg") {
    const blob = asBlob(await qr.getRawData("svg"));
    if (!blob) throw new Error("leeg");
    if (settings.caption) {
      downloadBlob(captionedSvg(await blob.text(), settings), `${filename}.svg`);
    } else {
      downloadBlob(blob, `${filename}.svg`);
    }
    return;
  }

  if (!settings.caption && ext !== "pdf") {
    const raw = ext === "jpg" ? "jpeg" : ext;
    const blob = asBlob(await qr.getRawData(raw));
    if (!blob) throw new Error("leeg");
    downloadBlob(blob, `${filename}.${ext}`);
    return;
  }

  const png = asBlob(await qr.getRawData("png"));
  if (!png) throw new Error("leeg");

  if (ext === "pdf") {
    const raster = settings.caption ? await composeRaster(png, settings, "image/png") : png;
    const dataUrl = await blobToDataUrl(raster);
    const image = await blobToImage(raster);
    const margin = 12;
    const widthMm = 140;
    const heightMm = widthMm * (image.height / image.width);
    const pdf = new jsPDF({
      unit: "mm",
      format: [widthMm + margin * 2, heightMm + margin * 2],
      compress: true,
    });
    pdf.setProperties({ title: "AFC Gent QR-code", creator: "AFC QR-generator" });
    pdf.addImage(dataUrl, "PNG", margin, margin, widthMm, heightMm);
    downloadBlob(pdf.output("blob"), `${filename}.pdf`);
    return;
  }

  const mime = ext === "jpg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
  let blob = await composeRaster(png, settings, mime);
  let finalExt: ExportExt = ext;
  if (ext === "webp" && blob.type !== "image/webp") {
    blob = await composeRaster(png, settings, "image/png");
    finalExt = "png";
  }
  downloadBlob(blob, `${filename}.${finalExt}`);
}
