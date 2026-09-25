"use client";

import { AnimatePresence, motion } from "motion/react";
import { Crosshair, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Chunk, LibraryDoc } from "@/lib/types";
import { cn, trimOverlap } from "@/lib/utils";
import { Markdown } from "./Markdown";

type Props = {
  doc: LibraryDoc | null;
  focusChunk: string | null;
  onClose: () => void;
  onOnly: (doc: LibraryDoc) => void;
  onDelete: (doc: LibraryDoc) => void;
};

export function DocumentViewer({ doc, focusChunk, onClose, onOnly, onDelete }: Props) {
  const { t, dir } = useI18n();
  const [chunks, setChunks] = useState<Chunk[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    setChunks(null);
    setError(null);
    api
      .chunks(doc.id)
      .then((c) => !cancelled && setChunks(c))
      .catch((e: Error) => !cancelled && setError(e.message === "offline" ? t("error.offline") : e.message));
    return () => {
      cancelled = true;
    };
  }, [doc, t]);

  useEffect(() => {
    if (!chunks || !focusChunk) return;
    const el = list.current?.querySelector(`[data-chunk="${CSS.escape(focusChunk)}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [chunks, focusChunk]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  const offscreen = dir === "rtl" ? "-100%" : "100%";
  let lastPage: number | null = null;

  return (
    <AnimatePresence>
      {doc && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-fg/15 backdrop-blur-[1px] dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label={doc.name}
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
            className="fixed inset-y-0 end-0 z-50 flex w-full flex-col border-s-2 border-fg bg-bg shadow-lg sm:w-[34rem]"
          >
            <header className="flex items-start gap-3 border-b border-line px-5 pb-4 pt-5">
              <div className="min-w-0 flex-1">
                <p className="tag uppercase">{doc.kind}</p>
                <h2 className="mt-2 break-words text-xl font-semibold leading-tight text-fg" dir="auto">{doc.name}</h2>
                <p className="mt-1 font-mono text-2xs text-subtle">
                  {doc.pages ? `${t("library.pages", { count: doc.pages })} · ` : ""}
                  {t("library.passages", { count: doc.chunks })}
                </p>
              </div>
              <button type="button" className="icon-btn" onClick={onClose} aria-label={t("app.close")}>
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex gap-2 border-b border-line px-5 py-2.5">
              <button type="button" className="btn-outline px-2.5 py-1.5 text-xs" onClick={() => onOnly(doc)}>
                <Crosshair className="h-3.5 w-3.5" /> {t("library.onlyThis")}
              </button>
              <button type="button" className="btn-outline px-2.5 py-1.5 text-xs hover:border-danger/30 hover:text-danger" onClick={() => onDelete(doc)}>
                <Trash2 className="h-3.5 w-3.5" /> {t("library.delete")}
              </button>
            </div>
            <div ref={list} className="flex-1 overflow-y-auto px-5 py-4 pb-safe">
              {error && <p className="text-sm text-danger">{error}</p>}
              {!chunks && !error && (
                <div className="space-y-4">
                  <p className="eyebrow">{t("viewer.loading")}</p>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-full animate-pulse rounded-full bg-sunken" />
                      <div className="h-3 w-11/12 animate-pulse rounded-full bg-sunken" />
                      <div className="h-3 w-2/3 animate-pulse rounded-full bg-sunken" />
                    </div>
                  ))}
                </div>
              )}
              {chunks?.map((c, i) => {
                const text = i > 0 && chunks[i - 1].page === c.page ? trimOverlap(chunks[i - 1].content, c.content) : c.content;
                const pageMarker = c.page && c.page !== lastPage ? c.page : null;
                lastPage = c.page ?? lastPage;
                const focused = c.id === focusChunk;
                return (
                  <div key={c.id} data-chunk={c.id}>
                    {pageMarker && (
                      <div className="my-4 flex items-center gap-3 first:mt-0">
                        <span className="eyebrow shrink-0">{t("answer.page", { page: pageMarker })}</span>
                        <span className="h-px flex-1 bg-line" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "relative -mx-3 mb-1 rounded-lg px-3 py-1 text-sm transition-colors duration-500 [&_.prose]:text-sm [&_.prose]:leading-relaxed",
                        focused && "my-2 bg-accent-soft py-3",
                      )}
                      dir="auto"
                    >
                      {focused && <span className="eyebrow mb-1 block text-accent">{t("viewer.cited")}</span>}
                      <Markdown text={text} renderCitation={(n) => `[${n}]`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
