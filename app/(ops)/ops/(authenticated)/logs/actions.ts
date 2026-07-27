"use server";

import { verifyOpsSession } from "@/lib/ops/auth";
import { createClient } from "@supabase/supabase-js";

export async function fetchOpsAuditLogs(limit = 100) {
  const session = await verifyOpsSession();
  if (!session) throw new Error("Unauthorized");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role required to bypass RLS

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("ops_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch ops audit logs:", error);
    throw new Error("Failed to fetch logs from database.");
  }

  return data;
}
