import { Mail, Clock3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function MailingPage() {
  return (
    <AppLayout
      title="Mailing"
      subtitle="Hier kun je mails uitsturen naar mensen die ingeschreven zijn/op de wachtlijst staan"
    >
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-[#041c3a] to-[#ed6425]" />

          <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#041c3a]/5">
              <Mail
                className="h-10 w-10 text-[#041c3a]"
                aria-hidden="true"
              />
            </div>

            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ed6425]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ed6425]">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Coming soon
            </span>

            <h2 className="text-2xl font-black tracking-tight text-[#041c3a] sm:text-3xl">
                Beetje te snel ;)
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Deze pagina is binnenkort beschikbaar (semster 2).
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}