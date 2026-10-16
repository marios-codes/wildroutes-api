import { setTimeout, clearTimeout } from 'node:timers';
import { checkDatabaseConnection } from '../repositories/health.repository';
import { isShutdownInitiated } from '../lifecycle/shutdown-state';

type ReadinessStatus = { status: 'ready' } | { status: 'not_ready' };

let activeProbe: Promise<void> | undefined;

const getDatabaseProbe = (): Promise<void> => {
  if (activeProbe === undefined) {
    activeProbe = checkDatabaseConnection().finally(() => {
      activeProbe = undefined;
    });
  }

  return activeProbe;
};

export const getReadiness = async (): Promise<ReadinessStatus> => {
  if (isShutdownInitiated()) {
    return { status: 'not_ready' };
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error('Readiness probe timed out'));
      }, 1_000);
    });

    await Promise.race([getDatabaseProbe(), timeout]);

    if (isShutdownInitiated()) {
      return { status: 'not_ready' };
    }

    return { status: 'ready' };
  } catch {
    return { status: 'not_ready' };
  } finally {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
};
