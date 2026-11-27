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

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function StaffAssignmentClientList({
  staff,
  user,
  divisions,
}: StaffAssignmentClientListProps) {
  const supabase = createClientComponentClient();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set([user?.id]));

  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('admin_table_presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(
          Object.values(state).flatMap((users: any) => users.map((u: any) => u.auth_user_id))
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

  const sortedStaff = [...staff].sort((a: any, b: any) => {
    if (a.auth_user_id === user?.id) return -1;
    if (b.auth_user_id === user?.id) return 1;
    return 0;
  });

  return (
    <>
      {/* Mobile stacked cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {sortedStaff.map((member: any) => {
          const isCurrentUser = member.auth_user_id === user?.id;
          const isOnline = onlineUsers.has(member.auth_user_id);
          const divisionsList =
            member.division_ids && member.division_ids.length > 0
              ? member.division_ids
                  .map((id: string) => (divisions || []).find((d: any) => d.id === id)?.display_name)
                  .filter(Boolean)
                  .join(', ')
              : 'All Divisions';

          return (
            <div
              key={member.id}
              className={`p-4 space-y-3.5 transition-colors ${
                isCurrentUser ? 'bg-slate-50/70' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-semibold text-[#0A1628] shrink-0">
                    {getInitials(member.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-[#0A1628] truncate">
                        {member.full_name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5 tabular-nums">
                      {member.whatsapp_phone}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                    isOnline ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md border ${
                        member.role === USER_ROLES.ADMIN
                          ? 'bg-[#0A1628] text-white border-[#0A1628]'
                          : 'bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {member.role}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        member.is_active
                          ? 'text-emerald-700 bg-emerald-50/70'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p
                    className="text-xs text-slate-500 truncate cursor-help"
                    title={divisionsList}
                  >
                    {divisionsList}
                  </p>
                </div>

                <div className="shrink-0">
                  <StaffActions
                    member={member}
                    divisions={divisions || []}
                    currentUserId={user?.id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop hairline table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <th className="py-3 pl-5 pr-3">Member</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Divisions</th>
              <th className="py-3 px-3">WhatsApp</th>
              <th className="py-3 px-3">Presence</th>
              <th className="py-3 px-3">Access</th>
              <th className="py-3 px-3 text-right">Joined</th>
              <th className="py-3 pl-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedStaff.map((member: any) => {
              const isCurrentUser = member.auth_user_id === user?.id;
              const isOnline = onlineUsers.has(member.auth_user_id);
              const divisionsList =
                member.division_ids && member.division_ids.length > 0
                  ? member.division_ids
                      .map((id: string) => (divisions || []).find((d: any) => d.id === id)?.display_name)
                      .filter(Boolean)
                      .join(', ')
                  : 'All Divisions';

              return (
                <tr
                  key={member.id}
                  className={`transition-colors duration-150 ${
                    isCurrentUser ? 'bg-slate-50/60' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-3.5 pl-5 pr-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[11px] font-semibold text-[#0A1628] shrink-0">
                        {getInitials(member.full_name)}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-[#0A1628] truncate">
                          {member.full_name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 shrink-0">
                            you
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 align-middle">
                    <span
                      className={`inline-flex items-center text-[11px] font-medium capitalize px-2 py-0.5 rounded-md border ${
                        member.role === USER_ROLES.ADMIN
                          ? 'bg-[#0A1628] text-white border-[#0A1628]'
                          : 'bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-3 text-xs text-slate-600 align-middle max-w-[200px] truncate cursor-help"
                    title={divisionsList}
                  >
                    {divisionsList}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono text-xs tabular-nums align-middle whitespace-nowrap">
                    {member.whatsapp_phone}
                  </td>
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isOnline ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        member.is_active
                          ? 'text-emerald-700 bg-emerald-50/70 border-emerald-200/70'
                          : 'text-slate-500 bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 text-xs tabular-nums text-right align-middle whitespace-nowrap">
                    {format(new Date(member.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3.5 pl-3 pr-5 align-middle text-right">
                    <StaffActions
                      member={member}
                      divisions={divisions || []}
                      currentUserId={user?.id}
                    />
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
