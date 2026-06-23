// Small UI helpers.

/** Trailing-throttle: at most one call per `ms`, always firing the last value. */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: any[] | null = null;

  const run = (args: any[]) => {
    last = Date.now();
    fn(...args);
  };

  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      run(args);
    } else {
      pending = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          if (pending) {
            const p = pending;
            pending = null;
            run(p);
          }
        }, remaining);
      }
    }
  }) as T;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Nearest value in a sorted (or unsorted) list. */
export function nearest(list: number[], value: number): number {
  if (!list.length) return value;
  return list.reduce((a, b) =>
    Math.abs(b - value) < Math.abs(a - value) ? b : a,
  );
}
