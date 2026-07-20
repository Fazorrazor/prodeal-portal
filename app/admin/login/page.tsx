import { AdminLoginForm } from '../../../components/admin/AdminLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Prodeal Industries Ltd',
};

export default function AdminLoginPage() {
  return (
    <>
      {/* Login Screen */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-brand-surface p-4">
        <div className="w-full max-w-md border-t-4 border-brand-deep-blue pt-12">
          
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl tracking-tighter uppercase text-brand-deep-blue">
              System <span className="text-brand-blue">Login</span>
            </h1>
            <p className="text-brand-deep-blue/80 text-[10px] uppercase font-bold tracking-widest mt-4">
              Secure portal access for authorized personnel only
            </p>
          </div>

          <AdminLoginForm />

        </div>
      </main>
    </>
  );
}
