// Types based on Supabase schema

export type EventType = 'workshop' | 'lezing' | 'project' | 'andere';
export type EventStatus = 'concept' | 'gepubliceerd' | 'afgerond' | 'geannuleerd';

export interface AcademicYear {
  id: string;
  naam: string;
  start_datum: string;
  eind_datum: string;
  is_huidig: boolean;
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
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventWithRegistrations extends Event {
  registrations_count: number;
}

export interface AcademicYearWithEvents extends AcademicYear {
  events: EventWithRegistrations[];
  total_events: number;
  total_registrations: number;
}

export interface CreateAcademicYearInput {
  naam: string;
  start_datum: string;
  eind_datum: string;
  is_huidig: boolean;
}