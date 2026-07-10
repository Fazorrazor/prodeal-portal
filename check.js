const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://abfphaytysoeghuzisiw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZnBoYXl0eXNvZWdodXppc2l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY5MTMxMCwiZXhwIjoyMDk2MjY3MzEwfQ.a3oCCXUek8PS_NZ1krh8yr3-j2p88rDc-nP2kTdLpts');

async function run() {
  const { data, error } = await supabase.from('system_error_logs').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(JSON.stringify(data, null, 2));
}

run();
