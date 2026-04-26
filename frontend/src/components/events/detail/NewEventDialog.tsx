import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventForm } from '../forms/EventForm';
import type { EventFormData } from '../../../types/event';
import { Plus } from 'lucide-react';

interface NewEventDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: EventFormData) => Promise<void>;
  loading?: boolean;
}

export function NewEventDialog({ open, onClose, onCreate, loading }: NewEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col max-h-[85vh] border-0 shadow-2xl"
        style={{ width: '60vw', maxWidth: '80vw' }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#041c3a] to-[#ed6425] flex-shrink-0" />

        <DialogHeader className="px-7 pt-6 pb-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#041c3a] flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[#041c3a] font-bold text-lg">
                Nieuw evenement aanmaken
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Vul de details in om een concept aan te maken
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-7 py-6 bg-slate-50/50">
          <EventForm
            onSave={onCreate}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}