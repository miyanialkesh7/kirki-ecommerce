/**
 * Settles like `promise`, but never resolves sooner than `minimumMs` after the call.
 * A rejection is passed on as soon as it happens.
 */
const withMinimumDuration = <T>(promise: Promise<T>, minimumMs: number): Promise<T> => {
  const minimumElapsed = new Promise<void>((resolve) => {
    setTimeout(resolve, minimumMs);
  });

  return Promise.all([promise, minimumElapsed]).then(([value]) => value);
};

export { withMinimumDuration };
