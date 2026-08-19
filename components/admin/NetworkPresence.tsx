'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type StaffMember = {
  id: string;
  full_name: string;
  auth_user_id: string;
  is_active: boolean;
};

export function NetworkPresence() {
  const supabase = createClientComponentClient();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel>;

    async function initPresence() {
      const { data: staffData } = await supabase
        .from('staff_members')
        .select('id, full_name, auth_user_id, is_active')
        .eq('is_active', true)
        .order('full_name');
        
      if (!mounted) return;
      if (staffData) setStaff(staffData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user.id);
      
      channel = supabase.channel('admin_presence');

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const onlineIds = new Set(
            Object.values(state).flatMap((users: any) => 
              users.map((u: any) => u.auth_user_id)
            )
          );
          setOnlineUsers(Array.from(onlineIds));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              auth_user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
    }

    initPresence();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  if (staff.length === 0) return null;

  return (
    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Network Status
        </span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          Live
        </span>
      </div>
      <div className="space-y-2.5">
        {staff.map((member) => {
          const isOnline = onlineUsers.includes(member.auth_user_id);
          const isMe = member.auth_user_id === currentUser;
          return (
            <div key={member.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 truncate pr-2 flex items-center gap-1.5">
                {member.full_name}
                {isMe && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-brand-blue/10 text-brand-blue">
                    You
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-slate-300'
                }`} />
                <span className={`text-[10px] font-medium ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {isOnline ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
