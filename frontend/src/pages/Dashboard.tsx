import { AppLayout } from '@/components/layout/AppLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentEvents } from '@/components/dashboard/RecentEvents';
import { AcademicYearBanner } from '@/components/dashboard/AcademicYearBanner';

export function Dashboard() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Overzicht van alle evenementen en activiteiten"
    >
      <div className="flex flex-col gap-8">
        {/* Academiejaar indicator */}
        <AcademicYearBanner />

        {/* Statistieken */}
        <StatsGrid />

        {/* Snelle acties */}
        <QuickActions />

        {/* Recente evenementen */}
        <RecentEvents />
      </div>
    </AppLayout>
  );
}