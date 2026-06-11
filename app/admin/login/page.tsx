import { AdminLoginForm } from '../../../components/admin/AdminLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Prodeal Industries',
};

export default function AdminLoginPage() {
  return (
    <>
      {/* Mobile Blocker */}
      <div className="lg:hidden flex flex-col items-center justify-center min-h-screen bg-brand-surface p-6 text-center border-t-4 border-brand-red">
        <div className="w-16 h-16 border-2 border-brand-red flex items-center justify-center mb-6">
          <span className="font-heading font-bold text-2xl text-brand-red">!</span>
        </div>
        <h1 className="font-heading font-bold text-3xl text-brand-deep-blue uppercase tracking-tighter mb-4">Desktop Only</h1>
        <p className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest max-w-sm leading-relaxed">
          The Prodeal Industries admin portal is optimized for data density and requires a larger screen. Please access this page from a desktop or laptop device.
        </p>
      </div>

      {/* Desktop Login */}
      <div className="hidden lg:flex min-h-screen flex-col items-center justify-center bg-brand-surface p-4">
        <div className="w-full max-w-md border-t-4 border-brand-deep-blue pt-12">
          
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl tracking-tighter uppercase text-brand-deep-blue">
              System <span className="text-brand-blue">Login</span>
            </h1>
            <p className="text-brand-deep-blue/60 text-[10px] uppercase font-bold tracking-widest mt-4">
              Secure portal access for authorized personnel only
            </p>
          </div>

          <AdminLoginForm />

        </div>
      </div>
    </>
  );
}
