import { Smartphone, HardDrive, ShieldCheck } from 'lucide-react';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { ClearCacheButton } from '../../../../components/admin/ClearCacheButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function SettingRow({ label, value, status, statusColor }: { label: string; value: string; status?: string; statusColor?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-4 border-b border-brand-border/30 last:border-b-0">
      <p className="w-44 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/50 shrink-0">{label}</p>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <code className="text-brand-deep-blue font-mono text-sm font-bold break-all flex-1">{value}</code>
        {status && (
          <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 px-1.5 py-0.5 border ${statusColor}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, accent = 'bg-brand-blue', delay = 0.3 }: { icon: React.ReactNode; title: string; accent?: string; delay?: number }) {
  return (
    <div className="flex items-center gap-3 pb-3 relative mb-4">
      <AnimatedBorder direction="bottom" delay={delay} />
      <div className={`w-1 h-5 ${accent} shrink-0`} />
      <div className="flex items-center gap-2">
        <span className="text-brand-deep-blue/50">{icon}</span>
        <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-brand-deep-blue">{title}</h2>
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

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      {/* Page header */}
      <div className="pb-6 relative">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">System Settings</h1>
        <p className="text-brand-deep-blue/60 text-sm font-mono uppercase tracking-widest mt-1">
          Platform integrations and division configuration
        </p>
      </div>

      {/* WhatsApp Business API */}
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          icon={<Smartphone className="w-4 h-4" />}
          title="WhatsApp Business API"
          accent="bg-emerald-500"
          delay={0.3}
        />

        {/* Security notice */}
        <div className="mb-4 flex gap-3 border-l-[3px] border-brand-blue bg-brand-blue/[0.04] px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Security Lock</p>
            <p className="text-xs font-mono text-brand-deep-blue/70 leading-relaxed">
              WhatsApp API credentials are hardcoded into the Vercel environment for security. To update these, modify your{' '}
              <code className="bg-black/10 px-1 py-0.5">.env.local</code> file or Vercel Project Settings and trigger a redeploy.
            </p>
          </div>
        </div>

        <div className="bg-black/[0.02] border-t border-b border-brand-border/30">
          <SettingRow
            label="Phone Number ID"
            value={process.env.META_WA_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID || 'Not Configured'}
            status="Active"
            statusColor="text-emerald-600 border-emerald-500/30 bg-emerald-50"
          />
          <SettingRow
            label="Permanent Access Token"
            value="••••••••••••••••••••••••••••••••"
            status="Hidden"
            statusColor="text-brand-deep-blue/40 border-brand-border/50"
          />
        </div>
      </section>

      {/* Edge Cache Management */}
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <SectionHeader
          icon={<HardDrive className="w-4 h-4" />}
          title="Edge Cache Management"
          accent="bg-brand-blue"
          delay={0.5}
        />

        <div className="space-y-4">
          <div className="flex gap-3 border-l-[3px] border-brand-deep-blue/30 bg-black/[0.025] px-4 py-3">
            <p className="text-sm text-brand-deep-blue/70 leading-relaxed">
              Prodeal portal utilises heavy edge caching to ensure maximum performance for clients.
              If product catalogs or chemical documentation links are not updating on the live site after database changes,
              trigger a global cache purge below.
            </p>
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <ClearCacheButton />
            <p className="text-[10px] font-mono text-brand-deep-blue/40 uppercase tracking-widest leading-relaxed max-w-xs mt-1">
              This will invalidate all ISR caches globally. Clients may experience a brief delay on the next page load while caches warm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
