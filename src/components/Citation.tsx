"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Source } from "@/lib/types";
import { cn } from "@/lib/utils";

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
          "mx-[1px] inline-grid h-[1.15rem] min-w-[1.15rem] -translate-y-[0.1em] place-items-center rounded px-1 font-mono text-[0.65rem] font-medium tabular-nums no-underline transition-colors",
          active ? "bg-accent text-white" : "bg-accent/10 text-accent hover:bg-accent hover:text-white",
        )}
      >
        {n}
      </button>
      <AnimatePresence>
        {peek && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="pointer-events-none absolute bottom-full start-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-lg border border-line bg-raised p-3 text-start shadow-pop rtl:translate-x-1/2 md:block"
          >
            <span className="mb-1 block truncate font-mono text-2xs uppercase tracking-wider text-subtle">
              {source.source}
              {source.page ? ` · p. ${source.page}` : ""}
            </span>
            <span className="line-clamp-4 block text-xs leading-relaxed text-muted">{source.content}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
