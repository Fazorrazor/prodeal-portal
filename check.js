const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key] = val.join('=').replace(/^"|"$/g, '').trim();
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: staff, error } = await supabase.from('staff_members').select('*').ilike('full_name', '%Desmond%');
  if (staff && staff.length > 0) {
    const authUserId = staff[0].auth_user_id;
    const { data: user } = await supabase.auth.admin.getUserById(authUserId);
    console.log('Email:', user.user.email);
  } else {
    console.log('No staff found named Desmond');
  }
}
check();
