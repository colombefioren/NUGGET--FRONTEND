"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "lumen:";

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage disabled (private mode): the app keeps working in memory.
    return false;
  }
}

/**
 * State mirrored to localStorage. Starts from `fallback` on the server and first client
 * render (so hydration matches), then swaps in the stored value.
 */
export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    setValue(readStorage(key, fallbackRef.current));
    setHydrated(true);
  }, [key]);

  // Debounced so a streaming answer doesn't serialize the whole history on every token.
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => writeStorage(key, value), 250);
    return () => window.clearTimeout(timer);
  }, [key, value, hydrated]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREFIX + key) setValue(readStorage(key, fallbackRef.current));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const reset = useCallback(() => setValue(fallbackRef.current), []);
  return [value, setValue, hydrated, reset] as const;
}
