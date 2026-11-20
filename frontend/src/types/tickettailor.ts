export interface TicketTailorDate {
  date: string;
  formatted: string;
  iso: string;
  time: string;
  timezone: string;
  unix: number;
}

export interface TicketTailorEvent {
  id: string;
  name: string;
  status: string;
  start: TicketTailorDate;
  end: TicketTailorDate;
  total_issued_tickets: number;
  total_orders: number;
  tickets_available: string;
  unavailable: string;
  url: string | null;
  currency: string;
  venue?: {
    name: string | null;
    country: string | null;
    postal_code: string | null;
  };
}

export type TicketTailorEventStatus =
  | 'draft'
  | 'published'
  | 'close_sales'
  | string;
