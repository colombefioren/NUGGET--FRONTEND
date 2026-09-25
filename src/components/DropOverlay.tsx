"use client";

import { AnimatePresence, motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/** Accepts files dropped anywhere on the window. */
export function DropOverlay({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setActive(true);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setActive(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setActive(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) onFiles(files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [onFiles]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-bg/90 p-4 backdrop-blur-sm"
        >
          <div className="grid h-full w-full place-items-center rounded-2xl border border-dashed border-accent/50">
            <div className="text-center">
              <UploadCloud className="mx-auto mb-4 h-10 w-10 text-accent" strokeWidth={1.5} />
              <p className="text-2xl font-medium text-fg sm:text-3xl">{t("drop.title")}</p>
              <p className="mt-2 text-sm text-muted">{t("drop.body")}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
