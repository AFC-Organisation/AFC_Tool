import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Shield } from 'lucide-react';
import { EventRollenManager } from './EventRollenManager';
import type { Event } from '../../../types/event';

interface EventRollenDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventRollenDialog({ event, open, onOpenChange }: EventRollenDialogProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  const isAdmin = !!userId && !!event.created_by && userId === event.created_by;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#041c3a] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-[#041c3a] leading-tight">Rollen</DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{event.titel}</p>
            </div>
            {isAdmin && (
              <Badge className="text-[10px] bg-[#ed6425]/15 text-[#ed6425] border-[#ed6425]/20 border shrink-0">
                <Shield className="w-2.5 h-2.5 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </DialogHeader>
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <EventRollenManager
            eventId={event.id}
            eventStatus={event.status}
            isAdmin={isAdmin}
            currentUserId={userId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}