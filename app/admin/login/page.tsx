import { AdminLoginForm } from '../../../components/admin/AdminLoginForm';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Staff Sign In',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] p-7 sm:p-8">
          {/* Header & Brand */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#0A1628] text-white flex items-center justify-center text-[11px] font-bold">
                  P
                </span>
                <span className="font-semibold text-sm tracking-tight text-[#0A1628]">
                  Prodeal
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase font-medium bg-slate-100 text-slate-500 border border-slate-200/70 px-2 py-0.5 rounded">
                Admin Desk
              </span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-[#0A1628]">
              Staff Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter your corporate credentials to access the operations console.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center text-xs text-slate-400 py-8">
                Loading sign-in form...
              </div>
            }
          >
            <AdminLoginForm />
          </Suspense>
        </div>

        {/* Quiet Security Footer */}
        <div className="mt-6 flex flex-col items-center text-center space-y-2.5">
          <p className="text-[11px] leading-relaxed text-slate-400 max-w-[320px]">
            Restricted workspace for authorized Prodeal Industries personnel. All access attempts are logged.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3" />
            <span>TLS Encrypted Session</span>
          </div>
        </div>
      </div>
    </main>
  );
}
