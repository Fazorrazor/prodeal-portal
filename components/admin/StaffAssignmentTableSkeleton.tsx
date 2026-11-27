export function StaffAssignmentTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="h-4 w-32 bg-slate-200/70 rounded animate-pulse" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/70">
              {['w-24', 'w-14', 'w-28', 'w-24', 'w-16', 'w-16', 'w-16', 'w-14'].map((w, idx) => (
                <th key={idx} className="py-3 px-4">
                  <div className={`h-3 ${w} bg-slate-200/70 rounded animate-pulse`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((row) => (
              <tr key={row}>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                    <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 w-14 bg-slate-100 rounded-md animate-pulse" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-3.5 w-14 bg-slate-100 rounded animate-pulse" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse ml-auto" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
