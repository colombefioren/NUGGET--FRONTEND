"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid items-end sm:place-items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-fg/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="relative w-full rounded-t-2xl border border-line bg-raised p-5 shadow-pop pb-safe sm:max-w-lg sm:rounded-2xl sm:pb-5"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
