"use client";

import { motion } from "motion/react";
import { ArrowUpRight, FileUp, FlaskConical } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LibraryDoc } from "@/lib/types";

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const } }),
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 sm:px-8">
      <motion.p variants={rise} initial="hidden" animate="show" custom={0} className="eyebrow">
        {t("empty.eyebrow")}
      </motion.p>
      <motion.h1
        variants={rise}
        initial="hidden"
        animate="show"
        custom={1}
        className="mt-4 text-balance font-serif text-[2.9rem] leading-[0.98] tracking-[-0.02em] sm:text-7xl"
      >
        {t("empty.title1")} <em className="text-accent">{t("empty.title2")}</em>
      </motion.h1>
      <motion.p variants={rise} initial="hidden" animate="show" custom={2} className="mt-5 max-w-xl text-pretty leading-relaxed text-muted">
        {t("empty.body")}
      </motion.p>

      {docs.length === 0 ? (
        <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="mt-10 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <button
            type="button"
            onClick={onBrowse}
            className="group relative overflow-hidden rounded-2xl border border-dashed border-fg/25 p-6 text-start transition-colors hover:border-accent/70 hover:bg-raised"
          >
            <FileUp className="h-5 w-5 text-accent transition-transform duration-300 group-hover:-translate-y-0.5" />
            <p className="mt-6 font-serif text-2xl">{t("empty.dropTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("library.formats")}</p>
            <p className="mt-4 font-mono text-2xs text-subtle">{t("empty.dropBody")}</p>
          </button>
          <button
            type="button"
            onClick={onSample}
            disabled={loadingSample}
            className="group rounded-2xl border border-line bg-raised p-6 text-start transition-colors hover:border-fg/25 disabled:opacity-60"
          >
            <FlaskConical className="h-5 w-5 text-muted" />
            <p className="mt-6 font-serif text-2xl">{t("library.sample")}</p>
            <p className="mt-1 text-sm text-muted">“Lighthouses — a short history”</p>
            <ArrowUpRight className="mt-4 h-4 w-4 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
          </button>
        </motion.div>
      ) : (
        <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="mt-10">
          <p className="eyebrow mb-3">{t("empty.suggestions")}</p>
          <ul className="divide-y divide-line border-y border-line">
            {suggestions.map((s, i) => (
              <motion.li key={s} variants={rise} initial="hidden" animate="show" custom={4 + i}>
                <button
                  type="button"
                  onClick={() => onPick(s)}
                  className="group flex w-full items-center gap-4 py-3.5 text-start text-[0.95rem] text-muted transition-colors hover:text-fg"
                >
                  <span className="font-mono text-2xs text-subtle">0{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-start" dir="auto">{s}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent rtl:-scale-x-100" />
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
