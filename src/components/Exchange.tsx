"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Message, Phase, Source } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Citation } from "./Citation";
import { LogoMark } from "./Logo";
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
const STEP_COLORS = ["bg-lilac", "bg-sky", "bg-mint"];

function PhaseTrack({ phase, hasHistory, scopeCount }: { phase: Phase; hasHistory: boolean; scopeCount: number | null }) {
  const { t } = useI18n();
  const steps = hasHistory ? STEPS : STEPS.slice(1);
  const colors = hasHistory ? STEP_COLORS : STEP_COLORS.slice(1);
  const current = steps.indexOf(phase);
  const scope = scopeCount === null ? t("phase.allDocs") : t("phase.someDocs", { count: scopeCount });
  return (
    <div className="flex items-center gap-4">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: state === "todo" ? 0.45 : 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 500, damping: 26 }}
              className={cn(
                "relative flex items-center gap-1.5 overflow-hidden rounded-full border-2 border-ink px-3 py-1 text-xs font-semibold",
                state === "todo" ? "border-dashed bg-transparent text-muted" : cn(colors[i], "text-onpastel"),
                state === "active" && "shadow-[2px_2px_0_0_rgb(var(--shadow))]",
              )}
            >
              {state === "done" && <Check className="h-3 w-3" strokeWidth={3.5} />}
              {state === "active" && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />}
              {t(`phase.${step as "rewriting" | "searching" | "writing"}`, { scope })}
              {state === "active" && <span className="absolute inset-y-0 w-1/3 animate-scan bg-white/40" />}
            </motion.li>
          );
        })}
      </ol>
    </div>
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
    <article className="group/exchange space-y-5 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96, rotate: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="flex justify-end"
      >
        <h2
          className="brut max-w-[88%] rounded-3xl rounded-ee-md bg-lilac px-5 py-3.5 font-display text-xl font-semibold leading-snug text-onpastel sm:text-2xl"
          dir="auto"
        >
          {question.content}
        </h2>
      </motion.div>

      {answer && (
        <div>
          <AnimatePresence mode="wait" initial={false}>
            {writing && !answer.content ? (
              <motion.div key="track" exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}>
                <PhaseTrack phase={phase!} hasHistory={followUp} scopeCount={scopeCount} />
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="brut rounded-3xl rounded-es-md bg-raised p-5 sm:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="sticker bg-gold">
                    <LogoMark className="h-3.5 w-3.5" /> nugget
                  </span>
                  {answer.timings && (
                    <span className="font-mono text-2xs text-subtle">
                      {t("answer.trace", {
                        count: sources.length,
                        retrieval: formatDuration(answer.timings.retrieval_ms),
                        generation: answer.timings.generation_ms ? formatDuration(answer.timings.generation_ms) : "…",
                      })}
                    </span>
                  )}
                </div>
                {answer.searchQuery && answer.searchQuery !== question.content && (
                  <p className="mb-3 truncate font-mono text-2xs text-subtle">↳ {t("answer.searchedFor", { query: answer.searchQuery })}</p>
                )}

                {answer.sources && sources.length === 0 && answer.content && (
                  <p className="mb-3 rounded-xl border-2 border-dashed border-ink/40 px-3 py-2 text-xs text-muted">{t("answer.noSources")}</p>
                )}

                {answer.content && (
                  <div dir="auto">
                    <Markdown text={answer.content} streaming={live && phase === "writing"} renderCitation={renderCitation} />
                  </div>
                )}

                {phase === "error" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-ink bg-bubble px-3 py-2.5 text-sm font-medium text-onpastel">
                    <span className="min-w-0 flex-1">{answer.error || t("error.generic")}</span>
                    {canRegenerate && (
                      <button type="button" onClick={onRegenerate} className="btn brut-sm press bg-raised px-2.5 py-1 text-fg">
                        <RotateCcw className="h-3.5 w-3.5" /> {t("answer.retry")}
                      </button>
                    )}
                  </div>
                )}
                {phase === "stopped" && <p className="sticker mt-3 bg-sunken">■ {t("phase.stopped")}</p>}

                {settled && answer.content && (
                  <div className="mt-4 flex items-center gap-2 border-t-2 border-dashed border-ink/15 pt-3">
                    <button type="button" onClick={copy} className="btn brut-sm press bg-raised px-2.5 py-1 text-xs">
                      {copied ? <Check className="h-3.5 w-3.5 text-ok" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? t("answer.copied") : t("answer.copy")}
                    </button>
                    {canRegenerate && (
                      <button type="button" onClick={onRegenerate} className="btn brut-sm press bg-raised px-2.5 py-1 text-xs">
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
              <h3 className="eyebrow mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-accent" />
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
