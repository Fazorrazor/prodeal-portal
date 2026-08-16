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
      // Fetch staff members
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
      
      // Setup Presence
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
    <div className="px-6 py-5 border-t border-brand-border/60 bg-brand-surface/30">
      <h3 className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest mb-4 flex items-center justify-between">
        Network Status
        <span className="text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 border border-brand-blue/20">LIVE</span>
      </h3>
      <div className="space-y-3">
        {staff.map((member) => {
          const isOnline = onlineUsers.includes(member.auth_user_id);
          const isMe = member.auth_user_id === currentUser;
          return (
            <div key={member.id} className="flex items-center justify-between group">
              <span className="text-xs font-semibold text-brand-deep-blue/80 group-hover:text-brand-deep-blue transition-colors truncate pr-2 flex items-center gap-1.5">
                {member.full_name}
                {isMe && <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/30 px-1">(You)</span>}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-none ${isOnline ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'bg-brand-border'} transition-colors duration-500`} />
                <span className={`text-[9px] font-mono font-bold tracking-wider ${isOnline ? 'text-emerald-600' : 'text-brand-deep-blue/40'}`}>
                  {isOnline ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
