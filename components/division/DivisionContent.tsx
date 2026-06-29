export function DivisionContent({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-16 bg-brand-surface min-h-[50vh]">
      <div className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
