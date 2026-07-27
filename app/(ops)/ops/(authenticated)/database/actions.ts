"use server";

import { verifyOpsSession } from "@/lib/ops/auth";
import { createClient } from "@supabase/supabase-js";

export async function fetchDatabaseStats() {
  const session = await verifyOpsSession();
  if (!session) throw new Error("Unauthorized");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role required

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("get_db_table_stats");

  if (error) {
    console.error("Failed to fetch database stats:", error);
    throw new Error("Failed to fetch database telemetry from Supabase.");
  }

  return data;
}
