'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DatabaseTablesInteractive({ groupedTables, sortedCategories }: { groupedTables: Record<string, any[]>, sortedCategories: string[] }) {
  const [activeTab, setActiveTab] = useState(sortedCategories[0] || '');

  const activeGroup = groupedTables[activeTab] || [];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#141416] pb-0">
        {sortedCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-3 text-[0.65rem] uppercase font-bold tracking-[0.2em] transition-colors relative ${
              activeTab === category ? 'text-[#E50914]' : 'text-[#A7A7AA] hover:text-[#F5F5F5]'
            }`}
          >
            {category}
            {activeTab === category && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#E50914]"
              />
            )}
          </button>
        ))}
      </div>

      {/* TABLE CONTENT */}
      {activeTab && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="border border-[#141416] bg-[#090909] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.1)_0%,transparent_70%)] pointer-events-none" />

            <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center">
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5]">
                {activeTab}
              </h2>
              <div className="text-[#A7A7AA] text-[0.6rem] uppercase tracking-widest">
                {activeGroup.length} ACTIVE TABLES
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.65rem]">
                <thead className="bg-[#111113] border-b border-[#141416] text-[#A7A7AA] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4 font-bold">
                      Table Identity
                    </th>
                    <th className="px-6 py-4 font-bold text-right">
                      Row Density
                    </th>
                    <th className="px-6 py-4 font-bold text-right">
                      Index Scans
                    </th>
                    <th className="px-6 py-4 font-bold text-right">
                      Seq Scans
                    </th>
                    <th className="px-6 py-4 font-bold text-right">
                      Health Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141416]">
                  {activeGroup.map((table: any) => {
                    // Simple heuristic for performance bottleneck (high sequential scans relative to index scans)
                    const hasWarning =
                      table.seq_scans > 100 &&
                      table.seq_scans > table.idx_scans * 5;
                    return (
                      <tr
                        key={table.table_name}
                        className="hover:bg-[#141416]/50 transition-colors group/row"
                      >
                        <td className="px-6 py-4 text-[#F5F5F5] tracking-wider">
                          <span className="group-hover/row:text-[#E50914] transition-colors">
                            {table.table_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-[#4CA6FF] font-bold">
                          {table.row_count?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-[#27D17F]">
                          {table.idx_scans?.toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 text-right ${hasWarning ? "text-[#E50914] animate-pulse" : "text-[#FFB020]"}`}
                        >
                          {table.seq_scans?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {hasWarning ? (
                            <span className="text-[0.55rem] tracking-widest font-bold uppercase text-[#E50914] border border-[#E50914]/30 bg-[#E50914]/10 px-2 py-1">
                              Missing Index
                            </span>
                          ) : (
                            <span className="text-[0.55rem] tracking-widest font-bold uppercase text-[#27D17F] border border-[#27D17F]/30 bg-[#27D17F]/10 px-2 py-1">
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
