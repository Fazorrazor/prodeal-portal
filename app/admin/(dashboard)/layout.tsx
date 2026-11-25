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

        {/* Main Dashboard Layout */}
        <div className="flex h-screen bg-brand-surface overflow-hidden font-body text-brand-deep-blue pb-16 lg:pb-0">
          {/* Sidebar */}
          <AdminSidebar userRole={userRole} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminTopbar />
            
            <main className="flex-1 overflow-y-auto bg-brand-surface relative">
              <div className="p-4 sm:p-8 min-h-full">
                {children}
              </div>
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <AdminMobileNav userRole={userRole} />
        </div>
      </>
    </AdminAuthGuard>
  );
}
