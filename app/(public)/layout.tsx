import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { ScrollReset } from '../../components/shared/ScrollReset';
import { InviteInterceptor } from '../../components/shared/InviteInterceptor';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <InviteInterceptor />
      <ScrollReset />
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
