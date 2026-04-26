import { AlertTriangle, Loader2 } from 'lucide-react';
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
import type { AcademicYearWithEvents } from '../types/academiejaar';

interface SetCurrentYearDialogProps {
  year: AcademicYearWithEvents | null;
  currentYear: AcademicYearWithEvents | undefined;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function SetCurrentYearDialog({
  year,
  currentYear,
  onConfirm,
  onCancel,
  loading,
}: SetCurrentYearDialogProps) {
  return (
    <AlertDialog open={!!year} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <AlertDialogContent className="border-slate-200 max-w-md">

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r from-[#ed6425] to-[#041c3a]" />

        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2.5 text-[#041c3a] font-bold">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-50 border border-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            Academiejaar wijzigen
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-slate-600 mt-1">
              <p>
                Je staat op het punt om{' '}
                <strong className="text-[#041c3a] font-semibold">{year?.naam}</strong>{' '}
                in te stellen als het huidige academiejaar.
              </p>
              {currentYear && (
                <p>
                  Het huidige academiejaar{' '}
                  <strong className="text-[#041c3a] font-semibold">{currentYear.naam}</strong>{' '}
                  zal worden gedeactiveerd.
                </p>
              )}
              <p className="text-slate-500">Wil je doorgaan?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={loading}
            className="border-slate-200 text-slate-600 hover:text-[#041c3a] hover:border-[#041c3a]/30"
          >
            Annuleren
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#041c3a] hover:bg-[#062d5f] text-white font-semibold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Bevestigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}