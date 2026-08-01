import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Info, Trash2 } from 'lucide-react';
import type { Event, EventFormData, EventStatus } from '../../../types/event';
import { isEditable, getNextStatus, EVENT_STATUS_LABELS, EVENT_TYPE_LABELS } from '../../../types/event';
import { EventForm } from '../forms/EventForm';
import { DataUploadForm } from '../forms/DataUploadForm';
import { EventDetail } from './EventDetail';
import { EventStatusBadge } from '../shared/EventStatusBadge';
import { EventTodoPanel } from './EventTodoPanel';
import { DeleteEventDialog } from './DeleteEventDialog';

interface EventDrawerProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onUpdateEvent: (id: string, data: Partial<EventFormData>) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<void>;
  onAdvanceStatus: (event: Event, newStatus: EventStatus) => Promise<void>;
  onImportTally: (eventId: string, data: any[]) => Promise<boolean>;
  onImportTicketTailor: (eventId: string, data: any[]) => Promise<boolean>;
  onImportFeedback: (eventId: string, data: any[]) => Promise<boolean>;
  onAddManualRegistration: (eventId: string, data: any) => Promise<boolean>;
  onAddManualFeedback: (eventId: string, data: any) => Promise<boolean>;
  loading?: boolean;
  onImportFromTicketTailorAPI: (eventId: string, ttEventId: string) => Promise<boolean>;
}

export function EventDrawer({
  event,
  open,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
  onAdvanceStatus,
  onImportTally,
  onImportTicketTailor,
  onImportFeedback,
  onAddManualRegistration,
  onAddManualFeedback,
  loading,
  onImportFromTicketTailorAPI,
}: EventDrawerProps) {
  const editable = isEditable(event.status);
  const nextStatus = getNextStatus(event.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSave = async (data: EventFormData) => {
    await onUpdateEvent(event.id, data);
    onClose();
  };

  const handleAdvance = async () => {
    if (nextStatus) {
      await onAdvanceStatus(event, nextStatus);
      onClose();
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    await onDeleteEvent(event.id);
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    onClose();
  };

  const statuses: EventStatus[] = ['concept', 'voorbereid', 'afgerond', 'compleet'];
  const currentIndex = statuses.indexOf(event.status);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          className="overflow-y-auto p-0 border-l border-slate-200 shadow-2xl flex flex-col"
          style={{ width: '40vw', maxWidth: '900px', minWidth: '600px' }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425] flex-shrink-0" />

          <SheetHeader className="px-7 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-[#041c3a] text-white border-[#041c3a] text-[10px] font-bold uppercase tracking-widest px-2"
              >
                {EVENT_TYPE_LABELS[event.type]}
              </Badge>
              <EventStatusBadge status={event.status} />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <SheetTitle className="text-left text-[#041c3a] font-black text-xl leading-tight">
                {event.titel || 'Nieuw concept'}
              </SheetTitle>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
                title="Evenement verwijderen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>


            {/* Status flow stepper */}
            <div className="flex items-center gap-1 mt-3">
              {statuses.map((s, idx) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      event.status === s
                        ? 'bg-[#041c3a] text-white shadow-sm'
                        : idx < currentIndex
                        ? 'bg-[#ed6425]/20 text-[#ed6425]'
                        : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    {idx < currentIndex && <span className="text-[#ed6425]">✓</span>}
                    {EVENT_STATUS_LABELS[s]}
                  </div>
                  {idx < statuses.length - 1 && (
                    <ArrowRight
                      className={`w-3 h-3 flex-shrink-0 ${
                        idx < currentIndex ? 'text-[#ed6425]' : 'text-slate-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </SheetHeader>

          <div className="py-6 px-7 flex-1 bg-slate-50/30 space-y-6">
            {/* concept → editable form + todos */}
            {event.status === 'concept' && (
              <>
                <EventTodoPanel event={event} />
                <EventForm
                  event={event}
                  onSave={handleSave}
                  onCancel={onClose}
                  loading={loading}
                />
              </>
            )}

            {/* voorbereid → read-only + todos + advance */}
            {event.status === 'voorbereid' && (
              <div className="space-y-5">
                <Alert className="border-[#041c3a]/20 bg-[#041c3a]/5">
                  <Info className="w-4 h-4 text-[#041c3a]" />
                  <AlertDescription className="text-[#041c3a]/80 text-sm">
                    Dit evenement is voorbereid. Je kan de informatie bekijken maar niet meer
                    aanpassen. Nadat het evenement heeft plaatsgevonden, kan je het afronden.
                  </AlertDescription>
                </Alert>
                <EventTodoPanel event={event} />
                <EventDetail event={event} />
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleAdvance}
                    disabled={loading}
                    className="bg-[#ed6425] hover:bg-[#ed6425]/90 text-white gap-2 font-semibold"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Afronden
                  </Button>
                </div>
              </div>
            )}

            {/* afgerond → data upload */}
            {event.status === 'afgerond' && (
              <div className="space-y-5">
                <Alert className="border-[#ed6425]/20 bg-[#ed6425]/5">
                  <Info className="w-4 h-4 text-[#ed6425]" />
                  <AlertDescription className="text-[#ed6425]/90 text-sm">
                    Het evenement heeft plaatsgevonden. Upload nu de inschrijvingen en feedback.
                    Daarna kan je het evenement als compleet markeren.
                  </AlertDescription>
                </Alert>
                <DataUploadForm
                  event={event}
                  onImportTally={(data) => onImportTally(event.id, data)}
                  onImportTicketTailor={(data) => onImportTicketTailor(event.id, data)}
                  onImportFeedback={(data) => onImportFeedback(event.id, data)}
                  onAddManualRegistration={(data) => onAddManualRegistration(event.id, data)}
                  onAddManualFeedback={(data) => onAddManualFeedback(event.id, data)}
                  onMarkComplete={handleAdvance}
                  loading={loading}
                  onImportFromTicketTailorAPI={(ttEventId) =>
                    onImportFromTicketTailorAPI(event.id, ttEventId)
                  }
                  onUpdateFinancieel={(value) =>
                    onUpdateEvent(event.id, { financieel_resultaat: value } as any)
                  }
                />
              </div>
            )}

            {/* compleet → full read-only */}
            {event.status === 'compleet' && (
              <div className="space-y-5">
                <Alert className="border-emerald-200 bg-emerald-50">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700 text-sm font-medium">
                    Dit evenement is compleet. Alle data is verwerkt.
                  </AlertDescription>
                </Alert>
                <EventDetail event={event} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteEventDialog
        open={deleteDialogOpen}
        eventTitel={event.titel || 'dit concept'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
}