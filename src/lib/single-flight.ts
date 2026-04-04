export function createSingleFlight<T>() {
  const inflight = new Map<string, Promise<T>>();

  return {
    run(key: string, task: () => Promise<T>) {
      const existing = inflight.get(key);
      if (existing) {
        return existing;
      }

      const next = task().finally(() => {
        inflight.delete(key);
      });

      inflight.set(key, next);
      return next;
    },
  };
}
