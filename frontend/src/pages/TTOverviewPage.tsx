import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Ticket,
  Users,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTicketTailorEvents } from '@/hooks/useTicketTailorEvents';
import type { TicketTailorEvent } from '@/types/tickettailor';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  close_sales: 'Sales closed',
};

function statusBadgeClass(status: string) {
  switch (status) {
    case 'published':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'close_sales':
      return 'border-[#ed6425]/25 bg-[#ed6425]/10 text-[#ed6425]';
    case 'draft':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    default:
      return 'border-slate-200 bg-white text-slate-600';
  }
}

function formatDate(event: TicketTailorEvent) {
  if (!event.start?.iso) return '—';
  try {
    return new Intl.DateTimeFormat('nl-BE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(event.start.iso));
  } catch {
    return event.start.formatted ?? '—';
  }
}

export default function TTOverviewPage() {
  const { events, loading, error, refetch } = useTicketTailorEvents();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q),
    );
  }, [events, search]);

  const totalIssued = useMemo(
    () => events.reduce((sum, e) => sum + (e.total_issued_tickets ?? 0), 0),
    [events],
  );

  return (
    <AppLayout
      title="TicketTailor Overview"
      subtitle="Live events en inschrijvingen via de TicketTailor API."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Events
            </div>
            <p className="mt-2 text-2xl font-bold text-[#041c3a]">
              {loading ? '—' : events.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Inschrijvingen
            </div>
            <p className="mt-2 text-2xl font-bold text-[#041c3a]">
              {loading ? '—' : totalIssued}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Ticket className="h-3.5 w-3.5" />
              Bron
            </div>
            <p className="mt-2 text-sm font-medium text-[#041c3a]">
              GET /v1/events · total_issued_tickets
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam, id of status…"
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={loading}
            className="self-start sm:self-auto"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Vernieuwen
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Kon TicketTailor niet laden</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="pl-4">Event</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Inschrijvingen</TableHead>
                <TableHead className="pr-4 text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Events ophalen…
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Geen events gevonden.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filtered.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="max-w-[320px] pl-4 whitespace-normal">
                      <div className="font-medium text-[#041c3a]">{event.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono">{event.id}</span>
                        {event.url && (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-[#ed6425] hover:underline"
                          >
                            Link
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(event)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(event.status)}
                      >
                        {STATUS_LABELS[event.status] ?? event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-base font-semibold text-[#041c3a]">
                        {event.total_issued_tickets ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 text-right text-slate-600">
                      {event.total_orders ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
