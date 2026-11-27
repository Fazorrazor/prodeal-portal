import type { Metadata } from 'next';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../../components/admin/AdminTopbar';
import { AdminAuthGuard } from '../../../components/admin/AdminAuthGuard';
import { AdminWalkthrough } from '../../../components/admin/AdminWalkthrough';
import { AdminMobileNav } from '../../../components/admin/AdminMobileNav';
import { SessionGuard } from '../../../components/admin/SessionGuard';
import { getVerifiedActiveStaff } from '../../../lib/supabase/requireStaff';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getVerifiedActiveStaff();
  const userRole = auth.ok ? auth.context.staff.role : 'agent';

  return (
    <AdminAuthGuard>
      <>
        <SessionGuard />
        <AdminWalkthrough />

        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#0A1628] pb-16 lg:pb-0">
          <AdminSidebar userRole={userRole} />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminTopbar />

            <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 min-h-full">
                {children}
              </div>
            </main>
          </div>

          <AdminMobileNav userRole={userRole} />
        </div>
      </>
    </AdminAuthGuard>
  );
}
