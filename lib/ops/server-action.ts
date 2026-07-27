/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import "server-only";
import { logger } from "./logger";

type ServerAction<TArgs extends any[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

/**
 * Wraps a Server Action with standard Ops observability (execution time, automatic error catching, and logging).
 * It automatically redacts arguments using the logger's built-in redaction rules.
 */
export function withObservability<TArgs extends any[], TReturn>(
  actionName: string,
  action: ServerAction<TArgs, TReturn>,
): ServerAction<TArgs, TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const startTime = performance.now();

    try {
      // Execute the actual action
      const result = await action(...args);
      const durationMs = performance.now() - startTime;

      logger.info(`Server Action Executed: ${actionName}`, {
        action: actionName,
        durationMs: Math.round(durationMs),
        status: "success",
      });

      return result;
    } catch (error: any) {
      const durationMs = performance.now() - startTime;

      logger.error(`Server Action Failed: ${actionName}`, error, {
        action: actionName,
        durationMs: Math.round(durationMs),
        status: "error",
        args, // Note: The logger automatically redacts sensitive keys before emitting.
      });

      // Re-throw the error so the caller handles it gracefully
      throw error;
    }
  };
}
