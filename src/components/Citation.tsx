"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Source } from "@/lib/types";
import { cn, plainText } from "@/lib/utils";

type Props = {
  n: number;
  source?: Source;
  active: boolean;
  onHover: (n: number | null) => void;
  onOpen: () => void;
};

export function Citation({ n, source, active, onHover, onOpen }: Props) {
  const [peek, setPeek] = useState(false);
  if (!source) return <sup className="font-mono text-subtle">[{n}]</sup>;
  return (
    <span className="relative inline-block align-baseline">
      <button
        type="button"
        onMouseEnter={() => {
          setPeek(true);
          onHover(n);
        }}
        onMouseLeave={() => {
          setPeek(false);
          onHover(null);
        }}
        onFocus={() => onHover(n)}
        onBlur={() => onHover(null)}
        onClick={onOpen}
        aria-label={`${source.source}${source.page ? `, p. ${source.page}` : ""}`}
        className={cn(
          "mx-[2px] inline-grid h-[1.2rem] min-w-[1.2rem] -translate-y-[0.12em] place-items-center rounded-md border-2 border-ink px-1 font-mono text-[0.62rem] font-bold tabular-nums text-onpastel no-underline transition-all duration-150",
          active ? "-translate-y-[0.3em] bg-accent text-white shadow-[2px_2px_0_0_rgb(var(--ink))]" : "bg-gold hover:bg-accent hover:text-white",
        )}
      >
        {n}
      </button>
      <AnimatePresence>
        {peek && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="brut pointer-events-none absolute bottom-full start-1/2 z-30 mb-2.5 hidden w-72 -translate-x-1/2 rounded-2xl bg-raised p-3 text-start rtl:translate-x-1/2 md:block"
          >
            <span className="sticker mb-2 max-w-full truncate bg-butter">
              {source.source}
              {source.page ? ` · p. ${source.page}` : ""}
            </span>
            <span className="line-clamp-4 block text-xs leading-relaxed text-muted">{plainText(source.content)}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
