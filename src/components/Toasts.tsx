"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Info, X } from "lucide-react";
import type { Toast } from "@/hooks/useToasts";
import { cn } from "@/lib/utils";

const ICON = { ok: Check, error: X, info: Info };
const TONE = { ok: "bg-mint", error: "bg-bubble", info: "bg-sky" };

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2.5 px-4 sm:bottom-6 sm:top-auto"
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
              initial={{ opacity: 0, y: 24, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 520, damping: 26 }}
              className={cn(
                "brut pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-2.5 text-start text-sm font-semibold text-onpastel",
                TONE[toast.tone],
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-onpastel bg-white">
                <Icon className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="line-clamp-2" dir="auto">
                {toast.text}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
