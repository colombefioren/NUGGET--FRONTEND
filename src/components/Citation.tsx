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
          "mx-px inline-grid h-[1.15rem] min-w-[1.15rem] -translate-y-[0.1em] place-items-center rounded-md border border-fg/70 px-1 font-mono text-[0.65rem] font-bold tabular-nums no-underline transition-all",
          active
            ? "-translate-y-[0.25em] border-fg bg-accent text-on-accent shadow-[2px_2px_0_0_rgb(var(--shadow))]"
            : "bg-accent-soft text-accent hover:bg-accent hover:text-on-accent",
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
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full start-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-xl border border-line bg-raised p-3 text-start shadow-md rtl:translate-x-1/2 md:block"
          >
            <span className="mb-1 block truncate text-xs font-medium text-fg">
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
