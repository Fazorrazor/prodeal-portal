import { validateServerEnv } from './env';

export type HealthCheckStatus = 'ok' | 'degraded' | 'skipped';

export interface HealthEvaluation {
  statusCode: 200 | 503;
  body: {
    status: 'ok' | 'degraded';
    checks: {
      env: Exclude<HealthCheckStatus, 'skipped'>;
      database: HealthCheckStatus;
    };
    timestamp: string;
    version: string;
  };
}

export interface HealthCheckDeps {
  env?: Record<string, string | undefined>;
  pingDatabase: () => Promise<boolean>;
  timeoutMs?: number;
  version?: string;
}

const DEFAULT_DB_TIMEOUT_MS = 3000;

async function runWithTimeout(
  fn: () => Promise<boolean>,
  timeoutMs: number
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn().catch(() => false),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function evaluateHealthChecks(
  deps: HealthCheckDeps
): Promise<HealthEvaluation> {
  const timestamp = new Date().toISOString();
  const version = deps.version ?? '1.0.0';
  const envResult = validateServerEnv(deps.env ?? process.env);

  if (!envResult.ok) {
    return {
      statusCode: 503,
      body: {
        status: 'degraded',
        checks: {
          env: 'degraded',
          database: 'skipped',
        },
        timestamp,
        version,
      },
    };
  }

  const dbOk = await runWithTimeout(
    deps.pingDatabase,
    deps.timeoutMs ?? DEFAULT_DB_TIMEOUT_MS
  );

  if (!dbOk) {
    return {
      statusCode: 503,
      body: {
        status: 'degraded',
        checks: {
          env: 'ok',
          database: 'degraded',
        },
        timestamp,
        version,
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      status: 'ok',
      checks: {
        env: 'ok',
        database: 'ok',
      },
      timestamp,
      version,
    },
  };
}
