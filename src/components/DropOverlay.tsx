"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LogoMark, Sparkle } from "./Logo";

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
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-lilac/85 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, rotate: -1 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="grid h-full w-full place-items-center rounded-[2rem] border-[3px] border-dashed border-onpastel"
          >
            <div className="relative text-center text-onpastel">
              <Sparkle className="absolute -start-10 -top-4 h-6 w-6 animate-twinkle text-accent" />
              <Sparkle className="absolute -end-8 top-10 h-4 w-4 animate-twinkle text-onpastel [animation-delay:.6s]" />
              <LogoMark className="mx-auto mb-4 h-24 w-24 animate-bob" />
              <p className="font-display text-4xl font-bold sm:text-6xl">{t("drop.title")}</p>
              <p className="mt-3 font-medium">{t("drop.body")}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
