"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Info, X } from "lucide-react";
import type { Toast } from "@/hooks/useToasts";
import { cn } from "@/lib/utils";

const ICON = { ok: Check, error: X, info: Info };

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6"
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
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-fg px-4 py-2.5 text-start text-sm text-bg shadow-pop"
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  toast.tone === "ok" && "bg-ok text-white",
                  toast.tone === "error" && "bg-danger text-white",
                  toast.tone === "info" && "bg-bg/20",
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="line-clamp-2">{toast.text}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
