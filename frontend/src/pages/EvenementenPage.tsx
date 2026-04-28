import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents, useEventMutations } from '../hooks/useEvents';
import { EventsOverview } from '../components/events/overview/EventsOverview';
import { NewEventDialog } from '../components/events/detail/NewEventDialog';
import { EventDrawer } from '../components/events/detail/EventDrawer';
import { AdvanceStatusDialog } from '../components/events/detail/AdvanceStatusDialog';
import type { Event, EventFormData, EventStatus } from '../types/event';
import { toast } from 'sonner';
import { useAcademicYears } from '../hooks/useAcademicYears';
import { AppLayout } from '../components/layout/AppLayout';

export default function EvenementenPage() {
  const { years } = useAcademicYears();
  const currentYear = years.find((j) => j.is_huidig);

  const { events, loading, refetch } = useEvents(currentYear?.id);
  const mutations = useEventMutations();

  const [searchParams, setSearchParams] = useSearchParams();

  const [newEventOpen, setNewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [advanceTarget, setAdvanceTarget] = useState<{
    event: Event;
    newStatus: EventStatus;
  } | null>(null);

  // Open dialog immediately when ?nieuw=1 is present in the URL
  useEffect(() => {
    if (searchParams.get('nieuw') === '1') {
      setNewEventOpen(true);
      // Clean up the query param without adding a history entry
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleNewEvent = () => setNewEventOpen(true);

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEvent(null);
    refetch();
  };

  const handleDeleteEvent = async (id: string) => {
    const ok = await mutations.deleteEvent(id);
    if (ok) {
      handleCloseDrawer();
      toast.success('Evenement verwijderd');
    } else {
      toast.error('Fout bij verwijderen: ' + mutations.error);
    }
  };

  const handleCreateEvent = async (data: EventFormData) => {
    if (!currentYear) return;
    const event = await mutations.createEvent(currentYear.id, data);
    if (event) {
      setNewEventOpen(false);
      refetch();
      toast.success('Concept aangemaakt!');
    } else {
      toast.error('Fout bij aanmaken: ' + mutations.error);
    }
  };

  const handleUpdateEvent = async (id: string, data: Partial<EventFormData>) => {
    const ok = await mutations.updateEvent(id, data);
    if (ok) {
      refetch();
      toast.success('Evenement opgeslagen');
    } else {
      toast.error('Fout bij opslaan: ' + mutations.error);
    }
    return ok;
  };

  const handleRequestAdvance = (event: Event, newStatus: EventStatus) => {
    setAdvanceTarget({ event, newStatus });
  };

  const handleConfirmAdvance = async () => {
    if (!advanceTarget) return;
    const ok = await mutations.advanceStatus(advanceTarget.event.id, advanceTarget.newStatus);
    if (ok) {
      setAdvanceTarget(null);
      refetch();
      if (selectedEvent?.id === advanceTarget.event.id) {
        setDrawerOpen(false);
        setSelectedEvent(null);
      }
      toast.success('Status bijgewerkt');
    } else {
      toast.error('Fout bij statuswijziging');
    }
  };

  const handleDrawerAdvance = async (event: Event, newStatus: EventStatus) => {
    handleRequestAdvance(event, newStatus);
  };

  if (!currentYear) {
    return (
      <AppLayout title="evenementen overzicht" subtitle="Overzicht van alle evenementen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[#041c3a]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-slate-500 font-medium">Geen huidig academiejaar gevonden.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="evenementen overzicht" subtitle="Overzicht van alle evenementen">
      <div className="p-6 max-w-screen-xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {/* AFC brand accent */}
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-[#041c3a] to-[#ed6425]" />
            <div>
              <h1 className="text-2xl font-black text-[#041c3a] tracking-tight">Evenementen</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Overzicht van alle activiteiten –{' '}
                <span className="font-semibold text-[#ed6425]">{currentYear.naam}</span>
              </p>
            </div>
          </div>
        </div>

        <EventsOverview
          events={events}
          onNewEvent={handleNewEvent}
          onOpenEvent={handleOpenEvent}
          onAdvanceStatus={handleRequestAdvance}
          onRevertStatus={handleRequestAdvance}
        />

        <NewEventDialog
          open={newEventOpen}
          onClose={() => setNewEventOpen(false)}
          onCreate={handleCreateEvent}
          loading={mutations.loading}
        />

        {selectedEvent && (
          <EventDrawer
            event={selectedEvent}
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onAdvanceStatus={handleDrawerAdvance}
            onImportTally={mutations.importTallyRegistrations}
            onImportTicketTailor={mutations.importTicketTailorRegistrations}
            onImportFeedback={mutations.importFeedback}
            onAddManualRegistration={mutations.addManualRegistration}
            onAddManualFeedback={mutations.addManualFeedback}
            loading={mutations.loading}
            onImportFromTicketTailorAPI={(eventId, ttEventId) =>
              mutations.importFromTicketTailorAPI(eventId, ttEventId)
            }
          />
        )}

        <AdvanceStatusDialog
          event={advanceTarget?.event ?? null}
          newStatus={advanceTarget?.newStatus ?? null}
          open={!!advanceTarget}
          onConfirm={handleConfirmAdvance}
          onCancel={() => setAdvanceTarget(null)}
          loading={mutations.loading}
        />
      </div>
    </AppLayout>
  );
}