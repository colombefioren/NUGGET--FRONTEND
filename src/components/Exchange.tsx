"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Message, Phase, Source } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Citation } from "./Citation";
import { Markdown } from "./Markdown";
import { SourceCard } from "./SourceCard";

type Props = {
  question: Message;
  answer?: Message;
  live: boolean;
  followUp: boolean;
  scopeCount: number | null;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onOpenSource: (source: Source) => void;
};

const STEPS: Phase[] = ["rewriting", "searching", "writing"];

function PhaseTrack({ phase, hasHistory, scopeCount }: { phase: Phase; hasHistory: boolean; scopeCount: number | null }) {
  const { t } = useI18n();
  const steps = hasHistory ? STEPS : STEPS.slice(1);
  const current = steps.indexOf(phase);
  const scope = scopeCount === null ? t("phase.allDocs") : t("phase.someDocs", { count: scopeCount });
  return (
    <ol className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: state === "todo" ? 0.35 : 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs text-muted"
          >
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full border",
                state === "done" && "border-fg bg-fg text-bg",
                state === "active" && "border-accent",
                state === "todo" && "border-line",
              )}
            >
              {state === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              {state === "active" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            </span>
            <span className={cn(state === "active" && "text-fg")}>
              {t(`phase.${step as "rewriting" | "searching" | "writing"}`, { scope })}
            </span>
            {state === "active" && (
              <span className="relative h-px w-10 overflow-hidden bg-line">
                <span className="absolute inset-y-0 w-1/3 animate-scan bg-accent" />
              </span>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}

export function Exchange({ question, answer, live, followUp, scopeCount, canRegenerate, onRegenerate, onOpenSource }: Props) {
  const { t, locale } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const sources = useMemo(() => answer?.sources ?? [], [answer?.sources]);
  const phase: Phase | undefined =
    answer && !live && answer.phase && !["done", "error"].includes(answer.phase) ? "stopped" : answer?.phase;

  const cited = useMemo(() => {
    const set = new Set<number>();
    for (const m of (answer?.content ?? "").matchAll(/\[(\d{1,2})\]/g)) set.add(Number(m[1]));
    return set;
  }, [answer?.content]);

  const renderCitation = useCallback(
    (n: number) => (
      <Citation
        n={n}
        source={sources[n - 1]}
        active={hovered === n}
        onHover={setHovered}
        onOpen={() => sources[n - 1] && onOpenSource(sources[n - 1])}
      />
    ),
    [hovered, onOpenSource, sources],
  );

  const copy = async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const writing = live && (phase === "writing" || phase === "searching" || phase === "rewriting");
  const settled = phase === "done" || phase === "stopped";

  return (
    <article className="group/exchange py-8 first:pt-4 sm:py-10">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        className="text-balance font-serif text-[1.75rem] leading-[1.15] tracking-[-0.01em] text-fg sm:text-[2.1rem]"
        dir="auto"
      >
        {question.content}
      </motion.h2>

      {answer && (
        <div className="mt-5">
          <AnimatePresence mode="wait" initial={false}>
            {writing && !answer.content ? (
              <motion.div key="track" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <PhaseTrack phase={phase!} hasHistory={followUp} scopeCount={scopeCount} />
              </motion.div>
            ) : (
              answer.timings && (
                <motion.p
                  key="trace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-2xs text-subtle"
                >
                  <span>
                    {t("answer.trace", {
                      count: sources.length,
                      retrieval: formatDuration(answer.timings.retrieval_ms),
                      generation: answer.timings.generation_ms ? formatDuration(answer.timings.generation_ms) : "…",
                    })}
                  </span>
                  {answer.searchQuery && answer.searchQuery !== question.content && (
                    <span className="truncate">· {t("answer.searchedFor", { query: answer.searchQuery })}</span>
                  )}
                </motion.p>
              )
            )}
          </AnimatePresence>

          {answer.sources && sources.length === 0 && answer.content && (
            <p className="mt-4 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-muted">
              {t("answer.noSources")}
            </p>
          )}

          {answer.content && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4" dir="auto">
              <Markdown text={answer.content} streaming={live && phase === "writing"} renderCitation={renderCitation} />
            </motion.div>
          )}

          {phase === "error" && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
              <span className="min-w-0 flex-1">{answer.error || t("error.generic")}</span>
              {canRegenerate && (
                <button type="button" onClick={onRegenerate} className="btn px-2 py-1 text-danger hover:bg-danger/10">
                  <RotateCcw className="h-3.5 w-3.5" /> {t("answer.retry")}
                </button>
              )}
            </div>
          )}
          {phase === "stopped" && <p className="mt-3 font-mono text-2xs uppercase tracking-wider text-subtle">— {t("phase.stopped")}</p>}

          {sources.length > 0 && (
            <section className="mt-7">
              <h3 className="eyebrow mb-3">{t("answer.sources")}</h3>
              <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
                {sources.map((s, i) => (
                  <SourceCard
                    key={s.id}
                    source={s}
                    index={i}
                    cited={!answer.content || cited.has(i + 1)}
                    highlighted={hovered === i + 1}
                    query={answer.searchQuery ?? question.content}
                    onHover={setHovered}
                    onOpen={() => onOpenSource(s)}
                  />
                ))}
              </div>
            </section>
          )}

          {settled && answer.content && (
            <div className="mt-4 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/exchange:opacity-100 sm:focus-within:opacity-100">
              <button type="button" onClick={copy} className="btn-ghost px-2 py-1 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t("answer.copied") : t("answer.copy")}
              </button>
              {canRegenerate && (
                <button type="button" onClick={onRegenerate} className="btn-ghost px-2 py-1 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> {t("answer.regenerate")}
                </button>
              )}
              <time className="ms-auto self-center font-mono text-2xs text-subtle" dateTime={new Date(answer.createdAt).toISOString()}>
                {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(answer.createdAt)}
              </time>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
