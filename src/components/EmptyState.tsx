"use client";

import { motion } from "motion/react";
import { ArrowUpRight, FileUp, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SAMPLE_TITLE } from "@/lib/sample";
import type { LibraryDoc } from "@/lib/types";
import { LogoMark } from "./Logo";

const rise = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.3, ease: [0.2, 0.7, 0.3, 1] as const },
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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-8">
      <div className="my-auto">
        <motion.div variants={rise} initial="hidden" animate="show" custom={0} className="mb-5">
          <LogoMark className="h-10 w-10" />
        </motion.div>
        <motion.p variants={rise} initial="hidden" animate="show" custom={1} className="eyebrow">
          {t("empty.eyebrow")}
        </motion.p>
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl"
        >
          {t("empty.title1")} <span className="text-accent">{t("empty.title2")}</span>
        </motion.h1>
        <motion.p variants={rise} initial="hidden" animate="show" custom={3} className="mt-4 max-w-lg text-pretty leading-relaxed text-muted">
          {t("empty.body")}
        </motion.p>

        {docs.length === 0 ? (
          <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onBrowse}
              className="card group p-5 text-start transition-colors hover:border-accent/40"
            >
              <FileUp className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <p className="mt-4 text-base font-semibold text-fg">{t("empty.dropTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("library.formats")}</p>
              <p className="mt-3 font-mono text-2xs text-subtle">{t("empty.dropBody")}</p>
            </button>
            <button
              type="button"
              onClick={onSample}
              disabled={loadingSample}
              className="card group p-5 text-start transition-colors hover:border-accent/40 disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <p className="mt-4 text-base font-semibold text-fg">{t("library.sample")}</p>
              <p className="mt-1 text-sm text-muted">“{SAMPLE_TITLE}”</p>
              <ArrowUpRight className="mt-3 h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
            </button>
          </motion.div>
        ) : (
          <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="mt-8">
            <p className="eyebrow mb-2">{t("empty.suggestions")}</p>
            <ul className="divide-y divide-line border-y border-line">
              {suggestions.map((s, i) => (
                <motion.li key={s} variants={rise} initial="hidden" animate="show" custom={5 + i}>
                  <button
                    type="button"
                    onClick={() => onPick(s)}
                    className="group flex w-full items-center gap-3 py-3.5 text-start text-[0.95rem] text-fg transition-colors hover:text-accent"
                  >
                    <span className="min-w-0 flex-1" dir="auto">
                      {s}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 rtl:-scale-x-100" />
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
