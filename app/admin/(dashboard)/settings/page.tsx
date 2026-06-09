import { Settings, ShieldCheck, Smartphone, HardDrive } from 'lucide-react';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { ClearCacheButton } from '../../../../components/admin/ClearCacheButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function SettingsPage() {
  const supabase = createServer() as any;

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
      <div className="pb-6 relative">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">System Settings</h1>
        <p className="text-brand-deep-blue/60 text-sm mt-1">
          Configure global platform integrations and division availability.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 mt-8">
        {/* WhatsApp Config Card */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 relative">
            <AnimatedBorder direction="bottom" delay={0.3} />
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">WhatsApp Business API</h2>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '100ms' }}>
              <p className="w-48 text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 shrink-0">
                Phone Number ID
              </p>
              <div className="flex items-center gap-4">
                <code className="text-brand-deep-blue font-mono text-sm font-bold">
                  {process.env.META_WA_PHONE_NUMBER_ID || 'Not Configured'}
                </code>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  Active
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '200ms' }}>
              <p className="w-48 text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 shrink-0">
                Permanent Access Token
              </p>
              <div className="flex items-center gap-4">
                <code className="text-brand-deep-blue/40 font-mono text-sm select-none">
                  ••••••••••••••••••••••••••••••••
                </code>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/40">
                  Hidden
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cache Management Card */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 relative">
            <AnimatedBorder direction="bottom" delay={0.4} />
            <HardDrive className="w-4 h-4 text-brand-blue" />
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">Edge Cache Management</h2>
            </div>
          </div>
          
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-brand-deep-blue/60 max-w-xl">
              Pro Deal portal utilizes heavy caching at the edge to ensure maximum performance for clients. 
              If product catalogs or chemical documentation links are not updating on the live site after database changes, you can manually trigger a global cache purge.
            </p>
            <div className="pt-2">
              <ClearCacheButton />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
