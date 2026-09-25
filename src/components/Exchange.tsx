"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2, RotateCcw } from "lucide-react";
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
  scopeCount: number | null;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onOpenSource: (source: Source) => void;
};

function PhaseLine({ phase, scopeCount }: { phase: Phase; scopeCount: number | null }) {
  const { t } = useI18n();
  const scope = scopeCount === null ? t("phase.allDocs") : t("phase.someDocs", { count: scopeCount });
  const label =
    phase === "rewriting"
      ? t("phase.rewriting")
      : phase === "searching"
        ? t("phase.searching", { scope })
        : t("phase.writing");
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
      <span>{label}</span>
    </div>
  );
}

export function Exchange({ question, answer, live, scopeCount, canRegenerate, onRegenerate, onOpenSource }: Props) {
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
    <article className="group/exchange border-t border-line py-7 first:border-t-0 first:pt-2 sm:py-8">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
        className="text-balance text-xl font-semibold leading-snug text-fg sm:text-[1.4rem]"
        dir="auto"
      >
        {question.content}
      </motion.h2>

      {answer && (
        <div className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            {writing && !answer.content ? (
              <motion.div key="track" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <PhaseLine phase={phase!} scopeCount={scopeCount} />
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {answer.timings && (
                  <p className="mb-2 font-mono text-2xs text-subtle">
                    {t("answer.trace", {
                      count: sources.length,
                      retrieval: formatDuration(answer.timings.retrieval_ms),
                      generation: answer.timings.generation_ms ? formatDuration(answer.timings.generation_ms) : "…",
                    })}
                    {answer.searchQuery && answer.searchQuery !== question.content && (
                      <> · {t("answer.searchedFor", { query: answer.searchQuery })}</>
                    )}
                  </p>
                )}

                {answer.sources && sources.length === 0 && answer.content && (
                  <p className="mb-3 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-muted">{t("answer.noSources")}</p>
                )}

                {answer.content && (
                  <div dir="auto">
                    <Markdown text={answer.content} streaming={live && phase === "writing"} renderCitation={renderCitation} />
                  </div>
                )}

                {phase === "error" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger">
                    <span className="min-w-0 flex-1">{answer.error || t("error.generic")}</span>
                    {canRegenerate && (
                      <button type="button" onClick={onRegenerate} className="btn-outline px-2.5 py-1 text-xs">
                        <RotateCcw className="h-3.5 w-3.5" /> {t("answer.retry")}
                      </button>
                    )}
                  </div>
                )}
                {phase === "stopped" && <p className="mt-2 text-xs text-subtle">{t("phase.stopped")}</p>}

                {settled && answer.content && (
                  <div
                    className={cn(
                      "mt-4 flex items-center gap-1 border-t border-line pt-3 opacity-0 transition-opacity",
                      "sm:group-hover/exchange:opacity-100 sm:focus-within:opacity-100 max-sm:opacity-100",
                    )}
                  >
                    <button type="button" onClick={copy} className="btn-ghost h-7 px-2 text-xs">
                      {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? t("answer.copied") : t("answer.copy")}
                    </button>
                    {canRegenerate && (
                      <button type="button" onClick={onRegenerate} className="btn-ghost h-7 px-2 text-xs">
                        <RotateCcw className="h-3.5 w-3.5" /> {t("answer.regenerate")}
                      </button>
                    )}
                    <time className="ms-auto font-mono text-2xs text-subtle" dateTime={new Date(answer.createdAt).toISOString()}>
                      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(answer.createdAt)}
                    </time>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {sources.length > 0 && (
            <section className="mt-6">
              <h3 className="eyebrow mb-3">
                {t("answer.sources")} · {sources.length}
              </h3>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
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
        </div>
      )}
    </article>
  );
}
