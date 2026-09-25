"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Info, X } from "lucide-react";
import type { Toast } from "@/hooks/useToasts";
import { cn } from "@/lib/utils";

const ICON = { ok: Check, error: X, info: Info };
const TONE = {
  ok: "text-ok",
  error: "text-danger",
  info: "text-accent",
};

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:top-auto"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = ICON[toast.tone];
          return (
            <motion.button
              key={toast.id}
              layout
              type="button"
              onClick={() => dismiss(toast.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: [0.2, 0.7, 0.3, 1] }}
              className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-lg border border-line bg-raised px-3.5 py-2.5 text-start text-sm shadow-md"
            >
              <Icon className={cn("h-4 w-4 shrink-0", TONE[toast.tone])} />
              <span className="line-clamp-2 text-fg" dir="auto">
                {toast.text}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
