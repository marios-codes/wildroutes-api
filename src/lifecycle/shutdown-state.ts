let shutdownStarted = false;

export const isShutdownInitiated = (): boolean => shutdownStarted;

export const markShutdownStarted = (): void => {
  shutdownStarted = true;
};
