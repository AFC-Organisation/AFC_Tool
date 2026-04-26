

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EventType = 'event' | 'workshop' | 'project';

export type EventStatus = 'concept' | 'voorbereid' | 'afgerond' | 'compleet';

export type SprekerRol = 'spreker' | 'moderator';

export type RegistratieBron = 'tally' | 'ticket_tailor' | 'manueel';

// ─── Core entities ────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  naam: string;
  start_datum: string;
  eind_datum: string;
  is_huidig: boolean;
  created_at: string;
}

export interface Domain {
  id: string;
  naam: string;
  created_at: string;
}

export interface Event {
  id: string;
  academic_year_id: string;
  type: EventType;
  status: EventStatus;
  is_published: boolean;
  titel: string;
  beschrijving_website: string | null;
  beschrijving_sociaal: string | null;
  event_datum: string | null;
  locatie: string | null;
  max_deelnemers: number | null;
  deuren_open: string | null;
  start_tijd: string | null;
  einde_tijd: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSpreker {
  id: string;
  event_id: string;
  rol: SprekerRol;
  naam: string;
  email: string | null;
  telefoon: string | null;
  omschrijving: string | null;
  volgorde: number;
  created_at: string;
}

export interface EventMateriaal {
  id: string;
  event_id: string;
  item: string;
  hoeveelheid: string | null;
  leverancier: string | null;
  contact_naam: string | null;
  contact_email: string | null;
  contact_telefoon: string | null;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  bron: RegistratieBron;
  email: string | null;
  faculteit: string | null;
  hoe_gevonden: string | null;
  // Tally-specifiek
  voornaam: string | null;
  achternaam: string | null;
  studiejaar: string | null;
  ingediend_op: string | null;
  // Ticket Tailor-specifiek
  naam: string | null;
  ingeschreven_op: string | null;
  checked_in: boolean;
  registered_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  email: string | null;
  schaal_1: number | null;
  schaal_2: number | null;
  schaal_3: number | null;
  wat_kon_beter: string | null;
  favo_onderdeel: string | null;
  andere_opmerkingen: string | null;
  created_at: string;
}

// ─── View types ───────────────────────────────────────────────────────────────

export interface EventWithCount extends Event {
  academiejaar: string;
  domeinen: string[];
  registratie_aantal: number;
  aanwezig_aantal: number;
  gemiddelde_score: number | null;
  feedback_aantal: number;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totaal_evenementen: number;
  komende_evenementen: number;
  totaal_inschrijvingen: number;
  totaal_feedback: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
}