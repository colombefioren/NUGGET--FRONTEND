"use client";

import { AnimatePresence, motion } from "motion/react";
import { Download, Menu, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Composer } from "@/components/Composer";
import { DocumentViewer } from "@/components/DocumentViewer";
import { DropOverlay } from "@/components/DropOverlay";
import { EmptyState } from "@/components/EmptyState";
import { Exchange } from "@/components/Exchange";
import { LanguageMenu } from "@/components/LanguageMenu";
import { LogoMark } from "@/components/Logo";
import { PasteDialog } from "@/components/PasteDialog";
import { Sidebar } from "@/components/Sidebar";
import { Toasts } from "@/components/Toasts";
import { useConversations } from "@/hooks/useConversations";
import { useLibrary } from "@/hooks/useLibrary";
import { useToasts } from "@/hooks/useToasts";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { SAMPLE_TEXT, SAMPLE_TITLE } from "@/lib/sample";
import type { LibraryDoc, Message, Source, Thread } from "@/lib/types";

function toMarkdown(thread: Thread) {
  const lines = [`# ${thread.title}`, ""];
  for (const m of thread.messages) {
    if (m.role === "user") lines.push(`## ${m.content}`, "");
    else {
      lines.push(m.content || m.error || "", "");
      m.sources?.forEach((s, i) => lines.push(`[${i + 1}]: ${s.source}${s.page ? `, p. ${s.page}` : ""}`));
      lines.push("");
    }
  }
  return lines.join("\n");
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function pairs(messages: Message[]) {
  const out: { question: Message; answer?: Message }[] = [];
  for (const m of messages) {
    if (m.role === "user") out.push({ question: m });
    else if (out.length) out[out.length - 1].answer = m;
  }
  return out;
}

function Nugget() {
  const { t, dir } = useI18n();
  const { toasts, push, dismiss } = useToasts();
  const library = useLibrary(push);
  const conversations = useConversations();
  const [draft, setDraft] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<"library" | "history">("library");
  const [viewer, setViewer] = useState<{ doc: LibraryDoc; chunk: string | null } | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const { active, busy } = conversations;
  const { docs, selected, scope } = library;
  const docIds = scope === null ? null : selected;
  const blocked = docs.length > 0 && selected.length === 0 ? t("composer.noScope") : null;
  const scopeLabel = scope === null ? t("library.scopeAll") : t("library.scopeSome", { count: selected.length, total: docs.length });

  const submit = useCallback(
    (text?: string) => {
      const q = (text ?? draft).trim();
      if (!q || blocked) return;
      stick.current = true;
      conversations.ask(q, docIds);
      setDraft("");
    },
    [blocked, conversations, docIds, draft],
  );

  // Follow the streaming answer unless the reader has scrolled up.
  useEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" });
  }, [active?.messages, busy]);

  useEffect(() => {
    stick.current = true;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [active?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        conversations.newThread();
        inputRef.current?.focus();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && busy) {
        conversations.stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, conversations]);

  const openSource = useCallback(
    (source: Source) => {
      const doc = docs.find((d) => d.id === source.doc_id);
      if (doc) setViewer({ doc, chunk: source.id });
    },
    [docs],
  );

  const exportThread = useCallback(
    (thread: Thread) => {
      const slug = thread.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 48) || "conversation";
      download(`${slug}.md`, toMarkdown(thread));
      push(t("toast.exported"), "ok");
    },
    [push, t],
  );

  const loadSample = async () => {
    setLoadingSample(true);
    await library.addText(SAMPLE_TEXT, SAMPLE_TITLE);
    setLoadingSample(false);
  };

  const sidebar = (
    <Sidebar
      library={library}
      conversations={conversations}
      tab={tab}
      onTab={setTab}
      onOpenDoc={(doc) => setViewer({ doc, chunk: null })}
      onPaste={() => setPasteOpen(true)}
      onExport={exportThread}
      onNavigate={() => setDrawer(false)}
      footerExtra={<LanguageMenu />}
    />
  );

  const exchanges = active ? pairs(active.messages) : [];
  const offscreen = dir === "rtl" ? "100%" : "-100%";

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <aside className="hidden w-[18.5rem] shrink-0 border-e-2 border-fg bg-bg lg:block">{sidebar}</aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-fg/15 backdrop-blur-[1px] dark:bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              className="fixed inset-y-0 start-0 z-50 w-[min(20rem,88vw)] border-e-2 border-fg bg-bg shadow-lg lg:hidden"
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line/70 px-3 sm:px-5 lg:border-transparent">
          <button type="button" className="icon-btn lg:hidden" onClick={() => setDrawer(true)} aria-label={t("app.menu")}>
            <Menu className="h-4 w-4" />
          </button>
          <span className="lg:hidden">
            <LogoMark className="h-7 w-7" />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm text-muted" dir="auto">
            {active?.title}
          </p>
          {active && (
            <button type="button" className="icon-btn" onClick={() => exportThread(active)} title={t("history.export")} aria-label={t("history.export")}>
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="btn-solid h-9 w-9 rounded-lg"
            onClick={() => {
              conversations.newThread();
              inputRef.current?.focus();
            }}
            title={`${t("app.newChat")} (Ctrl K)`}
            aria-label={t("app.newChat")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </header>

        {library.online === false && (
          <div className="border-b border-danger/20 bg-danger/5 px-4 py-2 text-center text-xs text-danger">
            {t("status.offlineBody")} <code className="rounded bg-danger/10 px-1 font-mono">uv run uvicorn app.main:app</code>
          </div>
        )}
        {library.health && !library.health.llm_configured && (
          <div className="border-b border-line bg-sunken px-4 py-2 text-center text-xs text-muted">{t("status.noKey")}</div>
        )}

        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {exchanges.length === 0 ? (
            <EmptyState
              docs={docs}
              onPick={(q) => submit(q)}
              onBrowse={() => fileRef.current?.click()}
              onSample={loadSample}
              loadingSample={loadingSample}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
              {exchanges.map(({ question, answer }, i) => {
                const last = i === exchanges.length - 1;
                return (
                  <Exchange
                    key={question.id}
                    question={question}
                    answer={answer}
                    live={busy && last}
                    scopeCount={docIds === null ? null : docIds.length}
                    canRegenerate={last && !busy}
                    onRegenerate={() => answer && conversations.regenerate(answer.id, docIds)}
                    onOpenSource={openSource}
                  />
                );
              })}
            </div>
          )}
          <div className="h-6 shrink-0" />
        </div>

        <div className="relative shrink-0 px-3 pb-safe sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-bg to-transparent" />

          <div className="mx-auto w-full max-w-3xl sm:pb-3">
            <Composer
              value={draft}
              onChange={setDraft}
              onSubmit={() => submit()}
              onStop={conversations.stop}
              onFiles={library.upload}
              onScopeClick={() => {
                setTab("library");
                if (window.matchMedia("(max-width: 1023px)").matches) setDrawer(true);
              }}
              busy={busy}
              followUp={exchanges.length > 0}
              scopeLabel={scopeLabel}
              blocked={blocked}
              inputRef={inputRef}
            />
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) library.upload(files);
          }}
        />
      </main>

      <DocumentViewer
        doc={viewer?.doc ?? null}
        focusChunk={viewer?.chunk ?? null}
        onClose={() => setViewer(null)}
        onOnly={(doc) => {
          library.setScope([doc.id]);
          setViewer(null);
          inputRef.current?.focus();
        }}
        onDelete={(doc) => {
          library.remove(doc);
          setViewer(null);
        }}
      />
      <PasteDialog open={pasteOpen} onClose={() => setPasteOpen(false)} onSubmit={(text, title) => library.addText(text, title)} />
      <DropOverlay onFiles={library.upload} />
      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

export default function Page() {
  return (
    <I18nProvider>
      <Nugget />
    </I18nProvider>
  );
}
