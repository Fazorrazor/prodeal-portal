export function TicketTableSkeleton() {
  const rows = Array.from({ length: 10 });
  
  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pr-4">
                <div className="h-3 w-16 bg-brand-surface rounded animate-pulse" />
              </th>
              <th className="px-4 py-4">
                <div className="h-3 w-12 bg-brand-surface rounded animate-pulse" />
              </th>
              <th className="px-4 py-4">
                <div className="h-3 w-20 bg-brand-surface rounded animate-pulse" />
              </th>
              <th className="px-4 py-4">
                <div className="h-3 w-24 bg-brand-surface rounded animate-pulse" />
              </th>
              <th className="px-4 py-4">
                <div className="h-3 w-16 bg-brand-surface rounded animate-pulse" />
              </th>
              <th className="py-4 pl-4 flex justify-end">
                <div className="h-3 w-16 bg-brand-surface rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="py-4 pr-4">
                  <div className="h-4 w-32 bg-brand-surface rounded animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-16 bg-brand-surface rounded animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-24 bg-brand-surface rounded animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-28 bg-brand-surface rounded animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-16 bg-brand-surface rounded animate-pulse" />
                </td>
                <td className="py-4 pl-4 flex justify-end">
                  <div className="h-4 w-8 bg-brand-surface rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
