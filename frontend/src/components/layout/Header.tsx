import { useEffect, useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split('@')[0] ??
    'Gebruiker';

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm px-8">
      {/* Page title */}
      <div className="flex items-center gap-4">
        {/* Orange accent bar */}
        <div className="h-8 w-0.5 rounded-full bg-[#ed6425]" />
        <div>
          <h1 className="text-[15px] font-bold text-[#041c3a] leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 mt-0.5 tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <Separator orientation="vertical" className="h-6" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-[#041c3a] hover:bg-zinc-50 transition-colors outline-none border border-transparent hover:border-zinc-200">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#041c3a] text-white text-[11px] font-bold tracking-wide">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block font-semibold text-[13px]">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 border-zinc-200 shadow-lg shadow-zinc-900/8">
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-[#041c3a]">{displayName}</p>
              <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-[13px]"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Uitloggen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}