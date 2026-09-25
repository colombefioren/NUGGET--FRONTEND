"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import type { Source } from "@/lib/types";
import { PASTELS, cn, highlightTerms, plainText } from "@/lib/utils";

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
  const pastel = PASTELS[index % PASTELS.length];
  return (
    <motion.button
      type="button"
      id={`source-${source.id}`}
      initial={{ opacity: 0, y: 14, rotate: index % 2 ? 1.5 : -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: 0.05 * index, type: "spring", stiffness: 380, damping: 24 }}
      onMouseEnter={() => onHover(index + 1)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index + 1)}
      onBlur={() => onHover(null)}
      onClick={onOpen}
      className={cn(
        "brut-sm press group relative flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col gap-2 overflow-hidden rounded-2xl p-3.5 text-start sm:w-auto sm:max-w-none",
        highlighted ? "-translate-x-0.5 -translate-y-0.5 bg-butter text-onpastel" : "bg-raised",
        !cited && !highlighted && "border-dashed opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid h-6 min-w-6 place-items-center rounded-lg border-2 border-ink px-1 font-mono text-2xs font-bold tabular-nums",
            cited ? "bg-gold text-onpastel" : "bg-transparent",
          )}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-start text-[0.8rem] font-bold" dir="auto">
          {source.source}
        </span>
        <span className="shrink-0 font-mono text-2xs opacity-60">
          {source.page ? t("answer.page", { page: source.page }) : `§${source.chunk + 1}`}
        </span>
      </div>
      <p className={cn("line-clamp-3 text-[0.8rem] leading-relaxed", highlighted ? "text-onpastel/80" : "text-muted")}>
        {highlightTerms(snippet, query).map((part, i) =>
          part.hit ? (
            <mark key={i} className="rounded bg-bubble px-0.5 font-semibold text-onpastel">
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <div
          className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-raised"
          title={t("answer.semantic", { value: meter.toFixed(2) })}
        >
          <motion.div
            className={cn("h-full border-e-2 border-ink", pastel)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(8, meter * 100)}%` }}
            transition={{ delay: 0.2 + 0.05 * index, type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>
        <span className="font-mono text-2xs font-bold tabular-nums">{meter.toFixed(2)}</span>
        {source.keyword_rank && (
          <span className="font-mono text-2xs opacity-60" title={t("answer.keyword", { rank: source.keyword_rank })}>
            kw#{source.keyword_rank}
          </span>
        )}
        {!cited && <span className="font-mono text-2xs opacity-60">· {t("answer.notCited")}</span>}
      </div>
    </motion.button>
  );
}
