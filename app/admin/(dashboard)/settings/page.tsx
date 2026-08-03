import { Smartphone, HardDrive, ShieldCheck } from 'lucide-react';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { ClearCacheButton } from '../../../../components/admin/ClearCacheButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';



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

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      {/* Page header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-display font-bold text-brand-deep-blue tracking-tight leading-none mb-2">System Settings</h1>
        <p className="text-slate-500 text-sm">
          Platform integrations and division configuration
        </p>
      </div>

      {/* WhatsApp Business API */}
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-brand-deep-blue leading-tight">WhatsApp Integration</h2>
              <p className="text-sm text-slate-500">Business API Connection Status</p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Connected
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-deep-blue mb-1">Security Lock Enabled</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                API credentials are securely stored in Vercel environment variables and cannot be accessed or modified from this dashboard. To update integration keys, please use the Vercel project settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edge Cache Management */}
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
              <HardDrive className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-deep-blue leading-tight">Edge Cache Management</h2>
              <p className="text-sm text-slate-500">Global CDN and ISR invalidation</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              Prodeal portal utilizes heavy edge caching to ensure maximum performance for clients. 
              If product catalogs or chemical documentation links are not updating on the live site after database changes, 
              trigger a global cache purge below.
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                This will invalidate all ISR caches globally. Clients may experience a brief delay on the next page load while caches warm.
              </p>
              <ClearCacheButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
