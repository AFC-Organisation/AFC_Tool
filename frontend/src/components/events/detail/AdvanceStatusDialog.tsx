import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowRight } from 'lucide-react';
import type { Event, EventStatus } from '../../../types/event';
import { EVENT_STATUS_LABELS, STATUS_ORDER } from '../../../types/event';

interface AdvanceStatusDialogProps {
  event: Event | null;
  newStatus: EventStatus | null;
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const statusMessages: Record<EventStatus, string> = {
  concept: '',
  voorbereid: 'Het evenement is volledig voorbereid en klaar om te plaatsvinden.',
  afgerond: 'Het evenement heeft plaatsgevonden. Je kan nu data uploaden.',
  compleet: 'Alle data is verwerkt. Het evenement wordt als compleet gemarkeerd.',
};
const revertMessages: Record<EventStatus, string> = {
  concept: 'Het evenement wordt teruggeplaatst naar concept.',
  voorbereid: 'Het evenement wordt teruggeplaatst naar voorbereid.',
  afgerond: 'Het evenement wordt teruggeplaatst naar afgerond.',
  compleet: '',
};
const statusColors: Record<EventStatus, string> = {
  concept: 'bg-slate-100 text-slate-700',
  voorbereid: 'bg-[#041c3a]/10 text-[#041c3a]',
  afgerond: 'bg-[#ed6425]/10 text-[#ed6425]',
  compleet: 'bg-emerald-50 text-emerald-700',
};

export function AdvanceStatusDialog({
  event,
  newStatus,
  open,
  onConfirm,
  onCancel,
  loading,
}: AdvanceStatusDialogProps) {
  const isRevert = event && newStatus
    ? STATUS_ORDER.indexOf(newStatus) < STATUS_ORDER.indexOf(event.status)
    : false;


  if (!event || !newStatus) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="border-0 shadow-2xl overflow-hidden p-0">
        {/* Header accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425]" />

        <div className="p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusColors[newStatus]}`}>
                {EVENT_STATUS_LABELS[newStatus]}
              </span>
            </div>
            <AlertDialogTitle className="text-[#041c3a] text-lg font-bold">
              Status wijzigen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              Je staat op het punt om{' '}
              <span className="font-semibold text-[#041c3a]">{event.titel}</span> te{' '}
              {isRevert ? 'terugzetten naar' : 'verplaatsen naar'}{' '}
              <span className="font-semibold text-[#ed6425]">{EVENT_STATUS_LABELS[newStatus]}</span>.
              <br />
              <br />
              {isRevert ? revertMessages[newStatus] : statusMessages[newStatus]}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel
              onClick={onCancel}
              disabled={loading}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={loading}
              className={
                isRevert
                  ? 'bg-slate-600 hover:bg-slate-700 text-white gap-2'
                  : 'bg-[#041c3a] hover:bg-[#041c3a]/90 text-white gap-2'
              }
            >
              {loading ? (
                'Bezig...'
              ) : isRevert ? (
                <>
                  Terugzetten
                  <ArrowRight className="w-4 h-4 rotate-180" />  {/* pijl omgekeerd */}
                </>
              ) : (
                <>
                  Bevestigen
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}