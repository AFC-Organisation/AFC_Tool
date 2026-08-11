import { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface EmailExportDialogProps {
  open: boolean;
  onClose: () => void;
  yearName: string | null;
  emails: string[];
  loading: boolean;
}

export function EmailExportDialog({ open, onClose, yearName, emails, loading }: EmailExportDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(emails.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-[#041c3a]/5 border border-[#041c3a]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#041c3a]" />
            </div>
            <DialogTitle className="text-[#041c3a] font-black text-lg leading-tight">
              E-mails — {yearName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-sm">
            {loading
              ? 'Laden...'
              : `${emails.length} unieke e-mailadres${emails.length === 1 ? '' : 'sen'} gevonden.`}
          </DialogDescription>
        </DialogHeader>

        {!loading && (
          <>
            <textarea
              readOnly
              value={emails.join('\n')}
              className="w-full h-56 text-sm font-mono border border-slate-200 rounded-lg p-3 bg-slate-50 text-slate-700 resize-none focus:outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={handleCopy}
              disabled={emails.length === 0}
              className="w-full bg-[#041c3a] hover:bg-[#041c3a]/90 text-white gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Gekopieerd!' : 'Kopieer alle e-mails'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}