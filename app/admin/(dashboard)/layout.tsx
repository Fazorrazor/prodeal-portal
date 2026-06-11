import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../../components/admin/AdminTopbar';
import { AdminAuthGuard } from '../../../components/admin/AdminAuthGuard';
import { createServer } from '../../../lib/supabase/server';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServer() as any;
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
        {/* Mobile Blocker */}
        <div className="lg:hidden flex flex-col items-center justify-center min-h-screen bg-brand-surface p-6 text-center border-t-4 border-brand-red">
          <div className="w-16 h-16 border-2 border-brand-red flex items-center justify-center mb-6">
            <span className="font-heading font-bold text-2xl text-brand-red">!</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-brand-deep-blue uppercase tracking-tighter mb-4">Desktop Only</h1>
          <p className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest max-w-sm leading-relaxed">
            The Prodeal Industries admin portal is optimized for data density and requires a larger screen. Please access this dashboard from a desktop or laptop device.
          </p>
        </div>

        {/* Main Desktop Dashboard */}
        <div className="hidden lg:flex h-screen bg-brand-surface overflow-hidden font-body text-brand-deep-blue">
          {/* Sidebar */}
          <AdminSidebar userRole={userRole} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminTopbar />
            
            <main className="flex-1 overflow-y-auto p-8 bg-brand-surface">
              {children}
            </main>
          </div>
        </div>
      </>
    </AdminAuthGuard>
  );
}
