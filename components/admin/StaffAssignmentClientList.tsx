'use client';

import { USER_ROLES } from '../../lib/config/roles';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { StaffActions } from './StaffActions';

type StaffAssignmentClientListProps = {
  staff: any[];
  user: any;
  divisions: any[];
};

export function StaffAssignmentClientList({ staff, user, divisions }: StaffAssignmentClientListProps) {
  const supabase = createClientComponentClient();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set([user?.id]));

  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('admin_table_presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(
          Object.values(state).flatMap((users: any) => 
            users.map((u: any) => u.auth_user_id)
          )
        );
        if (mounted) {
          setOnlineUsers(onlineIds);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <>
      {/* Mobile card list */}
      <div className="mt-2 md:hidden flex flex-col divide-y divide-brand-border/30 border-t border-brand-border/60">
        {staff
          .sort((a: any, b: any) => {
            if (a.auth_user_id === user?.id) return -1;
            if (b.auth_user_id === user?.id) return 1;
            return 0;
          })
          .map((member: any, i: number) => {
            const isCurrentUser = member.auth_user_id === user?.id;
            const isOnline = onlineUsers.has(member.auth_user_id);
            const divisionsList = member.division_ids && member.division_ids.length > 0
              ? member.division_ids.map((id: string) => (divisions || []).find((d: any) => d.id === id)?.display_name).filter(Boolean).join(', ')
              : 'Unassigned';

            return (
              <div
                key={member.id}
                className={`relative flex flex-col gap-3 py-4 pl-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isCurrentUser ? 'bg-brand-blue/[0.04]' : ''}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Left status accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isOnline ? 'bg-emerald-500' : 'bg-brand-border/60'}`} />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-brand-deep-blue leading-tight">{member.full_name}</span>
                      {isCurrentUser && <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/30 px-1">(You)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${member.role === USER_ROLES.ADMIN ? 'text-brand-red border-brand-red/30 bg-brand-red/5' : 'text-brand-blue border-brand-blue/30 bg-brand-blue/5'}`}>
                        {member.role}
                      </span>
                      <span className="text-[11px] text-brand-deep-blue/60 font-mono">{member.whatsapp_phone}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5 ${isOnline ? 'text-emerald-600' : 'text-brand-deep-blue/40'}`}>
                    <span className={`w-1.5 h-1.5 rounded-none ${isOnline ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'bg-brand-border/80'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-deep-blue/40 tracking-[0.2em] mb-0.5">Assigned Divisions</span>
                    <span className="text-xs font-semibold text-brand-deep-blue/80 leading-snug">{divisionsList}</span>
                  </div>
                  <div className="shrink-0">
                    <StaffActions member={member} divisions={divisions || []} currentUserId={user?.id} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto mt-4 border-t border-brand-border/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-3 pl-6 pr-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Name</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Role</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Service</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">WhatsApp</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Presence</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Status</th>
              <th className="py-3 pl-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest text-right">Joined</th>
              <th className="py-3 pl-4 pr-6 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {staff
              .sort((a: any, b: any) => {
                if (a.auth_user_id === user?.id) return -1;
                if (b.auth_user_id === user?.id) return 1;
                return 0;
              })
              .map((member: any, i: number) => {
                const isCurrentUser = member.auth_user_id === user?.id;
                const isOnline = onlineUsers.has(member.auth_user_id);
                const divisionsList = member.division_ids && member.division_ids.length > 0
                  ? member.division_ids.map((id: string) => (divisions || []).find((d: any) => d.id === id)?.display_name).filter(Boolean).join(', ')
                  : 'Unassigned';

                return (
                  <tr
                    key={member.id}
                    className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both border-b border-brand-border/30 last:border-0 ${isCurrentUser ? 'bg-brand-blue/[0.04]' : 'hover:bg-black/5'}`}
                    style={{ animationDelay: `${i * 30}ms` } as React.CSSProperties}
                  >
                    <td className="py-4 pl-6 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-brand-deep-blue text-sm">{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/30 px-1.5 py-0.5">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${member.role === USER_ROLES.ADMIN ? 'text-brand-red border-brand-red/30 bg-brand-red/5' : 'text-brand-blue border-brand-blue/30 bg-brand-blue/5'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-brand-deep-blue/80 font-medium align-middle max-w-[200px]">
                      {divisionsList}
                    </td>
                    <td className="px-4 py-4 text-brand-deep-blue/80 font-mono text-sm align-middle">{member.whatsapp_phone}</td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-none shrink-0 ${isOnline ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'bg-brand-border/80'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-emerald-600' : 'text-brand-deep-blue/40'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${member.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
                        {member.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-brand-deep-blue/60 text-sm font-mono text-right align-middle whitespace-nowrap">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 pl-4 pr-6 align-middle text-right">
                      <StaffActions member={member} divisions={divisions || []} currentUserId={user?.id} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
