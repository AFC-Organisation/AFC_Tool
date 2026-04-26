import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50/60">
      <Sidebar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            border: '1px solid #e4e4e7',
            fontSize: '13px',
          },
        }}
      />
      {/* Main content: offset for sidebar */}
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} />
        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
}