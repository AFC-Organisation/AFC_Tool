export type Kind =
  | "url"
  | "phone"
  | "email"
  | "event"
  | "workshop"
  | "project"
  | "tickettailor";

export type PayloadFields = {
  url: string;
  phone: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  ticketTailorEventId: string;
};

export type PayloadResult =
  | { ok: true; value: string; hint: string }
  | { ok: false; empty?: boolean; message: string };

export function normalizePhone(raw: string): string | null {
  let value = String(raw || "")
    .trim()
    .replace(/[\s.()-]/g, "");
  if (!value) return null;
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (value.startsWith("0")) value = `+32${value.slice(1)}`;
  if (!value.startsWith("+")) value = `+${value}`;
  const digits = value.slice(1);
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `+${digits}`;
}

export function normalizeUrl(raw: string): string | null {
  let value = String(raw || "").trim();
  if (!value) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeEmail(raw: string): string | null {
  const value = String(raw || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

export function ticketTailorEventLink(event: {
  url?: string | null;
  checkout_url?: string | null;
}): string | null {
  return normalizeUrl(event.url || event.checkout_url || "");
}

export function readPayload(kind: Kind, fields: PayloadFields): PayloadResult {
  if (kind === "url") {
    const raw = fields.url.trim();
    const url = normalizeUrl(raw);
    if (url) return { ok: true, value: url, hint: `Opent ${url}` };
    return raw
      ? { ok: false, message: "Deze link is niet geldig. Gebruik een adres zoals https://voorbeeld.be." }
      : { ok: false, empty: true, message: "Vul een link in, bijvoorbeeld een pagina of een formulier." };
  }

  if (kind === "phone") {
    const raw = fields.phone.trim();
    const phone = normalizePhone(raw);
    if (phone) return { ok: true, value: `tel:${phone}`, hint: `Start een oproep naar ${phone}` };
    return raw
      ? { ok: false, message: "Dit telefoonnummer is niet geldig." }
      : { ok: false, empty: true, message: "Vul het nummer in dat gebeld moet worden." };
  }

  if (kind === "email") {
    const raw = fields.email.trim();
    const email = normalizeEmail(raw);
    if (!email) {
      return raw
        ? { ok: false, message: "Dit e-mailadres is niet geldig." }
        : { ok: false, empty: true, message: "Vul het e-mailadres in dat geopend moet worden." };
    }
    const params = new URLSearchParams();
    const subject = fields.emailSubject.trim();
    const body = fields.emailBody.trim();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const query = params.toString();
    return {
      ok: true,
      value: query ? `mailto:${email}?${query}` : `mailto:${email}`,
      hint: `Opent een e-mail naar ${email}`,
    };
  }

  if (kind === "tickettailor") {
    const raw = fields.url.trim();
    const url = normalizeUrl(raw);
    if (url) {
      return {
        ok: true,
        value: url,
        hint: "Opent de TicketTailor-inschrijfpagina van dit event",
      };
    }
    return fields.ticketTailorEventId
      ? {
          ok: false,
          message: "Dit TicketTailor-event heeft geen geldige link.",
        }
      : {
          ok: false,
          empty: true,
          message: "Kies een gepubliceerd TicketTailor-event.",
        };
  }

  return {
    ok: false,
    empty: true,
    message: "Van zodra ticketing geïmplementeerd is, kun je hier automatisch een QR-code genereren.",
  };
}
