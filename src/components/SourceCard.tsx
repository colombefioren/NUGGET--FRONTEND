"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import type { Source } from "@/lib/types";
import { cn, highlightTerms, plainText } from "@/lib/utils";

type Props = {
  source: Source;
  index: number;
  cited: boolean;
  highlighted: boolean;
  query: string;
  onHover: (n: number | null) => void;
  onOpen: () => void;
};

export function SourceCard({ source, index, cited, highlighted, query, onHover, onOpen }: Props) {
  const { t } = useI18n();
  const snippet = plainText(source.content).slice(0, 320);
  // Fused RRF scores saturate on small libraries, so the meter shows semantic similarity.
  const meter = source.vector_score ?? source.score;
  return (
    <motion.button
      type="button"
      id={`source-${source.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      onMouseEnter={() => onHover(index + 1)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index + 1)}
      onBlur={() => onHover(null)}
      onClick={onOpen}
      className={cn(
        "group relative flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col gap-2 rounded-xl border bg-raised p-3.5 text-start transition-[border-color,box-shadow,opacity,transform] duration-200 sm:w-auto sm:max-w-none",
        highlighted ? "border-accent/70 shadow-lift -translate-y-0.5" : "border-line hover:border-fg/25",
        !cited && !highlighted && "opacity-60 hover:opacity-100",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid h-5 min-w-5 place-items-center rounded-md px-1 font-mono text-2xs tabular-nums",
            cited ? "bg-accent text-white" : "bg-sunken text-muted",
          )}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-start text-[0.8rem] font-medium text-fg" dir="auto">{source.source}</span>
        <span className="shrink-0 font-mono text-2xs text-subtle">
          {source.page ? t("answer.page", { page: source.page }) : `§${source.chunk + 1}`}
        </span>
      </div>
      <p className="line-clamp-3 text-[0.8rem] leading-relaxed text-muted">
        {highlightTerms(snippet, query).map((part, i) =>
          part.hit ? (
            <mark key={i} className="rounded-sm bg-accent/15 px-0.5 text-fg">
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-sunken" title={t("answer.semantic", { value: meter.toFixed(2) })}>
          <motion.div
            className="h-full rounded-full bg-fg/70"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(6, meter * 100)}%` }}
            transition={{ delay: 0.15 + 0.04 * index, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </div>
        <span className="font-mono text-2xs tabular-nums text-subtle">{meter.toFixed(2)}</span>
        {source.keyword_rank && (
          <span className="font-mono text-2xs text-subtle" title={t("answer.keyword", { rank: source.keyword_rank })}>
            · kw#{source.keyword_rank}
          </span>
        )}
        {!cited && <span className="font-mono text-2xs text-subtle">· {t("answer.notCited")}</span>}
      </div>
    </motion.button>
  );
}
