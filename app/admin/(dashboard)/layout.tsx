import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../../components/admin/AdminTopbar';
import { AdminAuthGuard } from '../../../components/admin/AdminAuthGuard';
import { AdminWalkthrough } from '../../../components/admin/AdminWalkthrough';
import { AdminMobileNav } from '../../../components/admin/AdminMobileNav';
import { createServer } from '../../../lib/supabase/server';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'agent';
  
  if (user) {
    const { data: staff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();
    if (staff?.role) userRole = staff.role;
  }

  return (
    <AdminAuthGuard>
      <>
        <AdminWalkthrough />

        {/* Main Dashboard Layout */}
        <div className="flex h-screen bg-brand-surface overflow-hidden font-body text-brand-deep-blue pb-16 lg:pb-0">
          {/* Sidebar */}
          <AdminSidebar userRole={userRole} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminTopbar />
            
            <main className="flex-1 overflow-y-auto p-8 bg-brand-surface">
              {children}
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <AdminMobileNav userRole={userRole} />
        </div>
      </>
    </AdminAuthGuard>
  );
}
