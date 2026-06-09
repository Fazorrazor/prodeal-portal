import { AdminLoginForm } from '../../../components/admin/AdminLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Pro Deal Industries',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-brand-border/40 p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl tracking-wide text-brand-deep-blue">
            PRO<span className="text-brand-red">DEAL</span> <span className="text-brand-blue">ADMIN</span>
          </h1>
          <p className="text-brand-deep-blue/60 text-sm mt-2">
            Secure portal access for authorized personnel only.
          </p>
        </div>

        <AdminLoginForm />

      </div>
    </div>
  );
}
