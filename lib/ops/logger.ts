/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import "server-only";

export type LogLevel = "info" | "warn" | "error" | "security" | "audit";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  service: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

// Fields that should always be redacted from logs
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "api_key",
  "access_token",
  "refresh_token",
  "mfa_code",
]);

/**
 * Redacts sensitive information from an object or string
 */
export function redact(data: any): any {
  if (data == null) return data;

  if (typeof data === "string") {
    // Basic string redaction could go here if we used regex,
    // but typically we redact by object key.
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redact);
  }

  if (typeof data === "object") {
    const redactedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        redactedObj[key] = "[REDACTED]";
      } else {
        redactedObj[key] = redact(value);
      }
    }
    return redactedObj;
  }

  return data;
}

export class OpsLogger {
  private static instance: OpsLogger;

  private constructor() {}

  static getInstance(): OpsLogger {
    if (!OpsLogger.instance) {
      OpsLogger.instance = new OpsLogger();
    }
    return OpsLogger.instance;
  }

  private async dispatch(entry: LogEntry) {
    // Write structured JSON to stdout so Vercel can ingest it via standard streams
    console.log(JSON.stringify(entry));

    // Also persist strictly to the append-only `ops_audit_log` Supabase table
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });

        await supabase.from("ops_audit_log").insert({
          level: entry.level,
          message: entry.message,
          environment: entry.environment,
          service: entry.service,
          metadata: entry.metadata,
          error: entry.error,
        });
      }
    } catch (e) {
      console.error("Failed to persist ops audit log to Supabase:", e);
    }
  }

  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error,
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      service: "prodeal-core",
      metadata: redact(metadata),
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.dispatch(entry);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log("warn", message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log("error", message, metadata, error);
  }

  security(message: string, metadata?: Record<string, any>) {
    this.log("security", message, metadata);
  }

  audit(
    action: string,
    operator: string,
    target: string,
    metadata?: Record<string, any>,
  ) {
    this.log("audit", action, { operator, target, ...metadata });
  }
}

export const logger = OpsLogger.getInstance();
