import { Smartphone, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClearCacheButton } from '../../../../components/admin/ClearCacheButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-blue shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-brand-deep-blue">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createServer() as any;

  // STRICT AUTH: Only 'admin' role can view settings
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== 'admin') {
    redirect('/admin');
  }

  const isWhatsAppConfigured = !!(process.env.META_WA_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID) && !!process.env.META_WA_ACCESS_TOKEN;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 pb-12">
      {/* Page header */}
      <div className="pb-6 border-b border-slate-100">
        <h1 className="text-2xl font-display font-semibold text-brand-deep-blue leading-none mb-2">System Settings</h1>
        <p className="text-slate-500 text-sm">
          Platform integrations and division configuration
        </p>
      </div>

      {/* WhatsApp Business API */}
      <section className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          icon={<Smartphone className="w-6 h-6" />}
          title="WhatsApp Integration"
          description="Manage the Meta Business API connection used for agent notifications."
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-brand-deep-blue mb-1">API Connection Status</h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Credentials are securely managed in the Vercel environment variables to prevent exposure.
            </p>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto">
            {isWhatsAppConfigured ? (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200/50 rounded-lg text-emerald-700 w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Connected</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/50 rounded-lg text-amber-700 w-full sm:w-auto">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Not Configured</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edge Cache Management */}
      <section className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <SectionHeader
          icon={<HardDrive className="w-6 h-6" />}
          title="Edge Cache Management"
          description="Manage global caching for product catalogs and dynamic pages."
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="max-w-lg">
            <h3 className="text-sm font-semibold text-brand-deep-blue mb-1">Purge Global Cache</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Force an immediate revalidation of all ISR caches globally. Clients may experience a brief delay on the next page load while caches warm. Only use this if live data is out of sync.
            </p>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto">
            <ClearCacheButton />
          </div>
        </div>
      </section>
    </div>
  );
}
