"use client";

import { motion } from "motion/react";
import { ArrowUpRight, FileUp, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SAMPLE_TITLE } from "@/lib/sample";
import type { LibraryDoc } from "@/lib/types";
import { PASTELS, cn } from "@/lib/utils";
import { LogoMark, Sparkle } from "./Logo";

const pop = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.06 * i, type: "spring" as const, stiffness: 380, damping: 26 },
  }),
};

type Props = {
  docs: LibraryDoc[];
  onPick: (q: string) => void;
  onBrowse: () => void;
  onSample: () => void;
  loadingSample: boolean;
};

export function EmptyState({ docs, onPick, onBrowse, onSample, loadingSample }: Props) {
  const { t } = useI18n();
  const strip = (name: string) => name.replace(/\.[a-z0-9]+$/i, "");
  const suggestions = docs.length
    ? [
        t("suggest.summary", { name: strip(docs[0].name) }),
        docs.length > 1
          ? t("suggest.compare", { a: strip(docs[0].name), b: strip(docs[1].name) })
          : t("suggest.timeline", { name: strip(docs[0].name) }),
        t("suggest.takeaways"),
        t("suggest.multilingual"),
      ]
    : [];

  return (
    // my-auto instead of justify-center: centered content that outgrows the viewport would be clipped at the top.
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-8">
      <div className="my-auto">
        <motion.div variants={pop} initial="hidden" animate="show" custom={0} className="relative mb-6 w-fit">
          <LogoMark className="h-20 w-20 animate-bob sm:h-24 sm:w-24" />
          <Sparkle className="absolute -end-5 top-1 h-5 w-5 animate-twinkle text-accent" />
          <Sparkle className="absolute -start-3 bottom-2 h-3 w-3 animate-twinkle text-lilac [animation-delay:.8s]" />
        </motion.div>
        <motion.p variants={pop} initial="hidden" animate="show" custom={1} className="sticker w-fit -rotate-2 bg-lime">
          {t("empty.eyebrow")}
        </motion.p>
        <motion.h1
          variants={pop}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-5 text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl"
        >
          {t("empty.title1")}{" "}
          <span className="brut mt-2 inline-block -rotate-2 rounded-2xl bg-gold px-3 pb-1 text-onpastel sm:rounded-3xl">
            {t("empty.title2")}
          </span>
        </motion.h1>
        <motion.p variants={pop} initial="hidden" animate="show" custom={3} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          {t("empty.body")}
        </motion.p>

        {docs.length === 0 ? (
          <motion.div variants={pop} initial="hidden" animate="show" custom={4} className="mt-10 grid gap-4 sm:grid-cols-[1.35fr_1fr]">
            <button
              type="button"
              onClick={onBrowse}
              className="brut press group relative overflow-hidden rounded-3xl bg-mint p-6 text-start text-onpastel"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-ink bg-white transition-transform group-hover:animate-wiggle">
                <FileUp className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <p className="mt-6 font-display text-2xl font-bold">{t("empty.dropTitle")}</p>
              <p className="mt-1 text-sm font-medium opacity-80">{t("library.formats")}</p>
              <p className="mt-4 font-mono text-2xs opacity-70">{t("empty.dropBody")}</p>
            </button>
            <button
              type="button"
              onClick={onSample}
              disabled={loadingSample}
              className="brut press group rounded-3xl bg-bubble p-6 text-start text-onpastel disabled:opacity-60"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-ink bg-white transition-transform group-hover:animate-wiggle">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <p className="mt-6 font-display text-2xl font-bold">{t("library.sample")}</p>
              <p className="mt-1 text-sm font-medium opacity-80">“{SAMPLE_TITLE}”</p>
              <ArrowUpRight className="mt-4 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" strokeWidth={2.5} />
            </button>
          </motion.div>
        ) : (
          <motion.div variants={pop} initial="hidden" animate="show" custom={4} className="mt-10">
            <p className="eyebrow mb-3">{t("empty.suggestions")}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <motion.li key={s} variants={pop} initial="hidden" animate="show" custom={5 + i}>
                  <button
                    type="button"
                    onClick={() => onPick(s)}
                    className={cn(
                      "brut-sm press group flex h-full w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-start text-[0.95rem] font-medium text-onpastel",
                      PASTELS[i % PASTELS.length],
                    )}
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white font-mono text-2xs font-bold">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-start" dir="auto">
                      {s}
                    </span>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 rtl:-scale-x-100" strokeWidth={2.5} />
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
