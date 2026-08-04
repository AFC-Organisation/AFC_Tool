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
import { Trash2 } from 'lucide-react';

interface DeleteEventDialogProps {
  open: boolean;
  eventTitel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteEventDialog({
  open,
  eventTitel,
  onConfirm,
  onCancel,
  loading,
}: DeleteEventDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="border-slate-200 shadow-2xl max-w-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-lg" />

        <AlertDialogHeader className="pt-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <AlertDialogTitle className="text-[#041c3a] font-black text-lg leading-tight">
              Evenement naar prullenbak?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed pl-12">
            <span className="font-semibold text-slate-700">"{eventTitel}"</span> wordt
            verplaatst naar de prullenbak. Je kan het daar nog terugzetten of
            definitief verwijderen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 mt-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
          >
            Annuleren
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold gap-2 border-0"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Verplaatsen...' : 'Naar prullenbak'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}