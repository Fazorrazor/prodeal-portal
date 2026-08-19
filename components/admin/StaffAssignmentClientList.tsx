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
      {/* ── MOBILE: Luxury Touch Cards (< 768px) ── */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
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
              : 'All Divisions';

            return (
              <div
                key={member.id}
                className={`p-4 transition-all space-y-3.5 ${
                  isCurrentUser ? 'bg-brand-blue/[0.03]' : 'hover:bg-slate-50/50'
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Header: Name + Presence */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-brand-deep-blue leading-tight">
                        {member.full_name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        member.role === USER_ROLES.ADMIN 
                          ? 'border-red-200 bg-red-50 text-brand-red' 
                          : 'border-blue-100 bg-blue-50 text-brand-blue'
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {member.whatsapp_phone}
                      </span>
                    </div>
                  </div>

                  {/* Presence indicator */}
                  <span className={`text-xs font-medium flex items-center gap-1.5 shrink-0 ${
                    isOnline ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                    }`} />
                    {isOnline ? 'Active' : 'Offline'}
                  </span>
                </div>

                {/* Division and Actions Footer */}
                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Assigned Division
                    </span>
                    <span 
                      className="text-xs font-semibold text-brand-deep-blue cursor-help"
                      title={divisionsList}
                    >
                      {divisionsList}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <StaffActions member={member} divisions={divisions || []} currentUserId={user?.id} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── DESKTOP: Borderless Luxury Table (>= 768px) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Member</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Service</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Phone</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Presence</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="py-3.5 pl-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Joined</th>
              <th className="py-3.5 pl-4 pr-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                  : 'All Divisions';

                return (
                  <tr
                    key={member.id}
                    className={`group transition-colors border-b border-slate-50 last:border-0 ${
                      isCurrentUser ? 'bg-brand-blue/[0.03]' : 'hover:bg-slate-50/50'
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="py-4 pl-6 pr-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-brand-deep-blue text-sm">{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        member.role === USER_ROLES.ADMIN 
                          ? 'border-red-200 bg-red-50 text-brand-red' 
                          : 'border-blue-100 bg-blue-50 text-brand-blue'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td 
                      className="px-4 py-4 text-xs text-brand-deep-blue font-medium align-middle max-w-[200px] truncate cursor-help"
                      title={divisionsList}
                    >
                      {divisionsList}
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-mono text-xs align-middle">
                      {member.whatsapp_phone}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                        }`} />
                        <span className={`text-xs font-medium ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {isOnline ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        member.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {member.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-slate-400 text-xs font-mono text-right align-middle whitespace-nowrap">
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
