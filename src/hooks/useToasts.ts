"use client";

import { useCallback, useRef, useState } from "react";
import { uid } from "@/lib/utils";

export type Toast = { id: string; tone: "ok" | "error" | "info"; text: string };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((all) => all.filter((t) => t.id !== id));
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (text: string, tone: Toast["tone"] = "info") => {
      const id = uid();
      setToasts((all) => [...all.slice(-3), { id, tone, text }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 3800));
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
