import { useRef, useCallback } from "react";

export function useFlushableDebounce<T extends any[]>(
  fn: (...args: T) => Promise<any> | any,
  delay = 600
) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgs = useRef<T | null>(null);

  const schedule = useCallback((...args: T) => {
    lastArgs.current = args;
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(async () => {
      t.current = null;
      const a = lastArgs.current;
      lastArgs.current = null;
      if (a) await fn(...a);
    }, delay);
  }, [fn, delay]);

  const flush = useCallback(async () => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
      const a = lastArgs.current;
      lastArgs.current = null;
      if (a) await fn(...a);
    }
  }, [fn]);

  const cancel = useCallback(() => {
    if (t.current) clearTimeout(t.current);
    t.current = null;
    lastArgs.current = null;
  }, []);

  return { schedule, flush, cancel };
}
