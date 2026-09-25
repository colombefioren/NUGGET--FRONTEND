"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ClipboardPaste, Download, Eye, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Conversations } from "@/hooks/useConversations";
import type { Library } from "@/hooks/useLibrary";
import { useI18n } from "@/lib/i18n";
import type { LibraryDoc, Thread } from "@/lib/types";
import { ACCEPTED_EXTENSIONS, cn, kindColor, relativeTime } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  library: Library;
  conversations: Conversations;
  tab: "library" | "history";
  onTab: (tab: "library" | "history") => void;
  onOpenDoc: (doc: LibraryDoc) => void;
  onPaste: () => void;
  onExport: (thread: Thread) => void;
  onNavigate: () => void;
  footerExtra?: React.ReactNode;
};

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-ink transition-colors",
        checked ? "bg-lime text-onpastel" : "bg-raised",
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 20 }}>
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function DocRow({ doc, checked, onToggle, onOpen, onDelete }: { doc: LibraryDoc; checked: boolean; onToggle: () => void; onOpen: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.85, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      className="group relative"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border-2 px-2.5 py-2 transition-all",
          checked ? "border-ink bg-raised shadow-[2px_2px_0_0_rgb(var(--shadow))]" : "border-dashed border-ink/40 opacity-70 hover:opacity-100",
        )}
      >
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 text-start" aria-pressed={checked} title={t("library.include")}>
          <Checkbox checked={checked} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-start text-[0.8125rem] font-semibold" dir="auto">
              {doc.name}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 font-mono text-2xs text-subtle">
              <span className={cn("rounded border border-ink px-1 font-bold uppercase text-onpastel", kindColor())}>{doc.kind}</span>
              {doc.pages ? `${t("library.pages", { count: doc.pages })} · ` : ""}
              {t("library.passages", { count: doc.chunks })}
            </span>
          </span>
        </button>
        <div className={cn("flex shrink-0 items-center gap-0.5 transition-opacity", confirming ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100")}>
          {confirming ? (
            <>
              <button type="button" className="btn rounded-lg border-2 border-ink bg-bubble px-1.5 py-0.5 text-2xs text-onpastel" onClick={onDelete}>
                {t("library.confirmDelete")}
              </button>
              <button type="button" className="icon-btn-quiet h-6 w-6" onClick={() => setConfirming(false)} aria-label={t("library.cancel")}>
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="icon-btn-quiet h-7 w-7" onClick={onOpen} aria-label={t("library.view")} title={t("library.view")}>
                <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <button type="button" className="icon-btn-quiet h-7 w-7 hover:text-danger" onClick={() => setConfirming(true)} aria-label={t("library.delete")} title={t("library.delete")}>
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  );
}

export function Sidebar({ library, conversations, tab, onTab, onOpenDoc, onPaste, onExport, onNavigate, footerExtra }: Props) {
  const { t, locale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const { docs, pending, selected, online } = library;
  const selectedSet = new Set(selected);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-5">
        <Logo />
        <button
          type="button"
          className="btn-solid h-9 px-3 text-xs"
          onClick={() => {
            conversations.newThread();
            onNavigate();
          }}
          title={`${t("app.newChat")} (Ctrl K)`}
          aria-label={t("app.newChat")}
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>

      <div className="brut-sm mx-4 grid grid-cols-2 rounded-2xl bg-raised p-1 text-xs font-bold" role="tablist">
        {(["library", "history"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            type="button"
            onClick={() => onTab(key)}
            className={cn("relative rounded-xl py-1.5 transition-colors", tab === key ? "text-onpastel" : "text-muted hover:text-fg")}
          >
            {tab === key && (
              <motion.span
                layoutId="tab"
                className={cn("absolute inset-0 rounded-xl border-2 border-ink", key === "library" ? "bg-gold" : "bg-bubble")}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative">
              {t(`nav.${key}`)}
              <span className="ms-1.5 font-mono opacity-60">{key === "library" ? docs.length : conversations.threads.length}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
        {tab === "library" ? (
          <>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-ink bg-raised px-3 py-2.5 text-start text-xs transition-colors hover:bg-mint hover:text-onpastel"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-mint text-onpastel group-hover:animate-wiggle">
                  <Upload className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{t("library.add")}</span>
                  <span className="block truncate text-2xs opacity-70">{t("library.dropHint")}</span>
                </span>
              </button>
              <button type="button" onClick={onPaste} className="icon-btn h-auto w-12 rounded-2xl bg-lilac text-onpastel" title={t("library.paste")} aria-label={t("library.paste")}>
                <ClipboardPaste className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length) library.upload(files);
                }}
              />
            </div>

            {docs.length > 0 && (
              <div className="mb-2 mt-5 flex items-center justify-between gap-2">
                <span className="eyebrow truncate">
                  {t("library.scope")} ·{" "}
                  {selected.length === docs.length ? t("library.scopeAll") : t("library.scopeSome", { count: selected.length, total: docs.length })}
                </span>
                <button
                  type="button"
                  onClick={() => library.setScope(selected.length === docs.length ? [] : null)}
                  className="shrink-0 text-2xs font-bold text-accent underline-offset-2 hover:underline"
                >
                  {selected.length === docs.length ? t("library.selectNone") : t("library.selectAll")}
                </button>
              </div>
            )}

            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {pending.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative overflow-hidden rounded-2xl border-2 border-ink bg-butter px-3 py-2.5 text-onpastel"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-[2.5px] border-onpastel/20 border-t-onpastel" />
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">{p.name}</span>
                      <span className="font-mono text-2xs font-bold">{t("library.uploading")}</span>
                    </div>
                    <span className="absolute inset-y-0 w-1/3 animate-scan bg-white/40" />
                  </motion.li>
                ))}
                {docs.map((doc) => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    checked={selectedSet.has(doc.id)}
                    onToggle={() => library.toggle(doc.id)}
                    onOpen={() => onOpenDoc(doc)}
                    onDelete={() => library.remove(doc)}
                  />
                ))}
              </AnimatePresence>
            </ul>
            {docs.length === 0 && pending.length === 0 && <p className="mt-6 text-xs leading-relaxed text-muted">{t("library.empty")}</p>}
            <p className="mt-6 font-mono text-2xs leading-relaxed text-subtle">{t("library.formats")}</p>
          </>
        ) : conversations.threads.length === 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-muted">{t("history.empty")}</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {conversations.threads.map((th) => {
                const active = th.id === conversations.active?.id;
                return (
                  <motion.li key={th.id} layout exit={{ opacity: 0, scale: 0.8, height: 0 }} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        conversations.select(th.id);
                        onNavigate();
                      }}
                      className={cn(
                        "relative w-full rounded-2xl border-2 py-2 pe-16 ps-3 text-start transition-all",
                        active
                          ? "border-ink bg-bubble text-onpastel shadow-[2px_2px_0_0_rgb(var(--shadow))]"
                          : "border-transparent hover:border-ink/40 hover:bg-raised",
                      )}
                    >
                      <span className="block truncate text-[0.8125rem] font-semibold" dir="auto">
                        {th.title || t("history.untitled")}
                      </span>
                      <span className={cn("block font-mono text-2xs", active ? "opacity-70" : "text-subtle")}>{relativeTime(th.updatedAt, locale)}</span>
                    </button>
                    <div className={cn("absolute end-1.5 top-1/2 flex -translate-y-1/2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100", active && "text-onpastel")}>
                      <button type="button" className="icon-btn-quiet h-7 w-7 hover:text-onpastel" title={t("history.export")} aria-label={t("history.export")} onClick={() => onExport(th)}>
                        <Download className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <button type="button" className="icon-btn-quiet h-7 w-7 hover:text-danger" title={t("history.delete")} aria-label={t("history.delete")} onClick={() => conversations.removeThread(th.id)}>
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t-2 border-ink px-4 py-3">
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-ink bg-raised px-2.5 py-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {online && <span className="absolute inset-0 animate-ping rounded-full bg-ok/60 [animation-duration:2.4s]" />}
            <span className={cn("relative h-2.5 w-2.5 rounded-full border border-ink", online === null ? "bg-subtle" : online ? "bg-lime" : "bg-danger")} />
          </span>
          <span className="truncate font-mono text-2xs font-bold">{online === false ? t("status.offline") : online ? t("status.online") : "…"}</span>
        </span>
        {footerExtra}
        <ThemeToggle />
      </div>
    </div>
  );
}
