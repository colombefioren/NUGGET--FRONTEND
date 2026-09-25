"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ClipboardPaste, Download, Eye, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Conversations } from "@/hooks/useConversations";
import type { Library } from "@/hooks/useLibrary";
import { useI18n } from "@/lib/i18n";
import type { LibraryDoc, Thread } from "@/lib/types";
import { ACCEPTED_EXTENSIONS, cn, relativeTime } from "@/lib/utils";
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
        "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
        checked ? "border-accent bg-accent text-on-accent" : "border-line bg-raised",
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.12 }}>
            <Check className="h-3 w-3" strokeWidth={3} />
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.15 } }}
      className={cn("group relative rounded-lg px-2 py-1.5 transition-colors hover:bg-sunken", !checked && "opacity-55")}
    >
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 text-start" aria-pressed={checked} title={t("library.include")}>
          <Checkbox checked={checked} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-start text-[0.8125rem] text-fg" dir="auto">
              {doc.name}
            </span>
            <span className="mt-0.5 block font-mono text-2xs text-subtle">
              <span className="uppercase">{doc.kind}</span>
              {doc.pages ? ` · ${t("library.pages", { count: doc.pages })}` : ""} · {t("library.passages", { count: doc.chunks })}
            </span>
          </span>
        </button>
        <div className={cn("flex shrink-0 items-center transition-opacity", confirming ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100")}>
          {confirming ? (
            <>
              <button type="button" className="btn-ghost h-6 px-1.5 text-2xs text-danger hover:bg-danger/10" onClick={onDelete}>
                {t("library.confirmDelete")}
              </button>
              <button type="button" className="icon-btn h-6 w-6" onClick={() => setConfirming(false)} aria-label={t("library.cancel")}>
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="icon-btn h-7 w-7" onClick={onOpen} aria-label={t("library.view")} title={t("library.view")}>
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="icon-btn h-7 w-7 hover:text-danger" onClick={() => setConfirming(true)} aria-label={t("library.delete")} title={t("library.delete")}>
                <Trash2 className="h-3.5 w-3.5" />
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
          className="btn-solid h-9 w-9 rounded-lg"
          onClick={() => {
            conversations.newThread();
            onNavigate();
          }}
          title={`${t("app.newChat")} (Ctrl K)`}
          aria-label={t("app.newChat")}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 flex gap-4 border-b border-line text-sm" role="tablist">
        {(["library", "history"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            type="button"
            onClick={() => onTab(key)}
            className={cn("relative pb-2.5 transition-colors", tab === key ? "text-fg" : "text-muted hover:text-fg")}
          >
            {t(`nav.${key}`)}
            <span className="ms-1.5 font-mono text-2xs text-subtle">{key === "library" ? docs.length : conversations.threads.length}</span>
            {tab === key && <motion.span layoutId="tab" className="absolute inset-x-0 -bottom-px h-px bg-accent" transition={{ duration: 0.2 }} />}
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
                className="flex items-center gap-2.5 rounded-lg border border-dashed border-line px-3 py-2.5 text-start text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg"
              >
                <Upload className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-medium text-fg">{t("library.add")}</span>
                  <span className="block truncate text-2xs text-subtle">{t("library.dropHint")}</span>
                </span>
              </button>
              <button type="button" onClick={onPaste} className="icon-btn h-auto w-11 border border-line" title={t("library.paste")} aria-label={t("library.paste")}>
                <ClipboardPaste className="h-4 w-4" />
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
              <div className="mb-1 mt-5 flex items-center justify-between gap-2">
                <span className="eyebrow truncate">
                  {t("library.scope")} ·{" "}
                  {selected.length === docs.length ? t("library.scopeAll") : t("library.scopeSome", { count: selected.length, total: docs.length })}
                </span>
                <button
                  type="button"
                  onClick={() => library.setScope(selected.length === docs.length ? [] : null)}
                  className="shrink-0 text-2xs text-accent hover:underline"
                >
                  {selected.length === docs.length ? t("library.selectNone") : t("library.selectAll")}
                </button>
              </div>
            )}

            <ul className="mt-1">
              <AnimatePresence initial={false}>
                {pending.map((p) => (
                  <motion.li key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2 py-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-fg">{p.name}</span>
                      <span className="font-mono text-2xs text-subtle">{t("library.uploading")}</span>
                    </div>
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
            {docs.length === 0 && pending.length === 0 && <p className="mt-6 px-2 text-xs leading-relaxed text-muted">{t("library.empty")}</p>}
            <p className="mt-6 px-2 font-mono text-2xs leading-relaxed text-subtle">{t("library.formats")}</p>
          </>
        ) : conversations.threads.length === 0 ? (
          <p className="mt-2 px-2 text-xs leading-relaxed text-muted">{t("history.empty")}</p>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {conversations.threads.map((th) => {
                const active = th.id === conversations.active?.id;
                return (
                  <motion.li key={th.id} layout exit={{ opacity: 0, height: 0 }} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        conversations.select(th.id);
                        onNavigate();
                      }}
                      className={cn(
                        "relative w-full rounded-lg py-2 pe-16 ps-3 text-start transition-colors",
                        active ? "bg-sunken" : "hover:bg-sunken/70",
                      )}
                    >
                      {active && <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-accent" />}
                      <span className="block truncate text-[0.8125rem] text-fg" dir="auto">
                        {th.title || t("history.untitled")}
                      </span>
                      <span className="block font-mono text-2xs text-subtle">{relativeTime(th.updatedAt, locale)}</span>
                    </button>
                    <div className="absolute end-1 top-1/2 flex -translate-y-1/2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                      <button type="button" className="icon-btn h-7 w-7" title={t("history.export")} aria-label={t("history.export")} onClick={() => onExport(th)}>
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="icon-btn h-7 w-7 hover:text-danger" title={t("history.delete")} aria-label={t("history.delete")} onClick={() => conversations.removeThread(th.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <span className="relative flex h-2 w-2 shrink-0">
          {online && <span className="absolute inset-0 animate-ping rounded-full bg-ok/50 [animation-duration:2.4s]" />}
          <span className={cn("relative h-2 w-2 rounded-full", online === null ? "bg-subtle" : online ? "bg-ok" : "bg-danger")} />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-2xs text-subtle">
          {online === false ? t("status.offline") : online ? t("status.online") : "…"}
        </span>
        {footerExtra}
        <ThemeToggle />
      </div>
    </div>
  );
}
