"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { streamQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { usePersistentState } from "@/lib/storage";
import type { Message, Thread } from "@/lib/types";
import { uid } from "@/lib/utils";

const MAX_THREADS = 60;

/** Conversation history lives entirely in localStorage; the API is stateless. */
export function useConversations() {
  const { t, locale } = useI18n();
  const [threads, setThreads] = usePersistentState<Thread[]>("threads", []);
  const [activeId, setActiveId] = usePersistentState<string | null>("active-thread", null);
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const active = useMemo(() => threads.find((th) => th.id === activeId) ?? null, [threads, activeId]);

  const patchMessage = useCallback(
    (threadId: string, messageId: string, patch: (m: Message) => Partial<Message>) => {
      setThreads((all) =>
        all.map((th) =>
          th.id !== threadId
            ? th
            : {
                ...th,
                updatedAt: Date.now(),
                messages: th.messages.map((m) => (m.id === messageId ? { ...m, ...patch(m) } : m)),
              },
        ),
      );
    },
    [setThreads],
  );

  const run = useCallback(
    async (threadId: string, question: string, history: Message[], docIds: string[] | null) => {
      const answerId = uid();
      const answer: Message = {
        id: answerId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        phase: history.length ? "rewriting" : "searching",
      };
      setThreads((all) =>
        all.map((th) => (th.id === threadId ? { ...th, messages: [...th.messages, answer] } : th)),
      );

      controller.current?.abort();
      const ctrl = new AbortController();
      controller.current = ctrl;
      setBusy(true);
      // Tokens arrive faster than React needs to paint; batch them per animation frame.
      let buffer = "";
      let frame = 0;
      const flush = () => {
        frame = 0;
        const chunk = buffer;
        buffer = "";
        if (chunk) patchMessage(threadId, answerId, (m) => ({ content: m.content + chunk }));
      };

      try {
        await streamQuery(
          {
            question,
            history: history
              .filter((m) => m.content && !m.error)
              .slice(-8)
              .map((m) => ({ role: m.role, content: m.content })),
            doc_ids: docIds,
            locale,
          },
          {
            onSources: ({ sources, search_query, timings }) =>
              patchMessage(threadId, answerId, () => ({
                sources,
                searchQuery: search_query,
                timings,
                phase: "writing",
              })),
            onToken: (token) => {
              buffer += token;
              if (!frame) frame = requestAnimationFrame(flush);
            },
            onDone: ({ timings }) => {
              cancelAnimationFrame(frame);
              flush();
              patchMessage(threadId, answerId, () => ({ timings, phase: "done" }));
            },
            onError: (detail) => {
              cancelAnimationFrame(frame);
              flush();
              patchMessage(threadId, answerId, () => ({
                phase: "error",
                error: detail === "offline" ? t("error.offline") : detail,
              }));
            },
          },
          ctrl.signal,
        );
        if (ctrl.signal.aborted) {
          cancelAnimationFrame(frame);
          flush();
          patchMessage(threadId, answerId, (m) => (m.phase === "done" ? {} : { phase: "stopped" }));
        }
      } catch {
        patchMessage(threadId, answerId, () => ({ phase: "error", error: t("error.offline") }));
      } finally {
        if (controller.current === ctrl) {
          controller.current = null;
          setBusy(false);
        }
      }
    },
    [locale, patchMessage, setThreads, t],
  );

  const ask = useCallback(
    (question: string, docIds: string[] | null) => {
      const text = question.trim();
      if (!text || busy) return;
      const userMessage: Message = { id: uid(), role: "user", content: text, createdAt: Date.now() };
      let threadId = activeId;
      let history: Message[] = [];
      if (active) {
        history = active.messages;
        setThreads((all) =>
          all.map((th) =>
            th.id === active.id
              ? { ...th, updatedAt: Date.now(), messages: [...th.messages, userMessage] }
              : th,
          ),
        );
      } else {
        threadId = uid();
        const thread: Thread = {
          id: threadId,
          title: text.length > 72 ? `${text.slice(0, 70)}…` : text,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [userMessage],
        };
        setThreads((all) => [thread, ...all].slice(0, MAX_THREADS));
        setActiveId(threadId);
      }
      run(threadId!, text, history, docIds);
    },
    [active, activeId, busy, run, setActiveId, setThreads],
  );

  /** Re-asks the question behind an assistant message, replacing it and anything after it. */
  const regenerate = useCallback(
    (answerId: string, docIds: string[] | null) => {
      if (!active || busy) return;
      const index = active.messages.findIndex((m) => m.id === answerId);
      const question = active.messages[index - 1];
      if (index < 1 || question?.role !== "user") return;
      const history = active.messages.slice(0, index - 1);
      setThreads((all) =>
        all.map((th) => (th.id === active.id ? { ...th, messages: active.messages.slice(0, index) } : th)),
      );
      run(active.id, question.content, history, docIds);
    },
    [active, busy, run, setThreads],
  );

  const stop = useCallback(() => controller.current?.abort(), []);

  const newThread = useCallback(() => {
    stop();
    setActiveId(null);
  }, [setActiveId, stop]);

  const select = useCallback(
    (id: string) => {
      if (id !== activeId) stop();
      setActiveId(id);
    },
    [activeId, setActiveId, stop],
  );

  const removeThread = useCallback(
    (id: string) => {
      if (id === activeId) newThread();
      setThreads((all) => all.filter((th) => th.id !== id));
    },
    [activeId, newThread, setThreads],
  );

  const clearThreads = useCallback(() => {
    newThread();
    setThreads([]);
  }, [newThread, setThreads]);

  return { threads, active, busy, ask, regenerate, stop, newThread, select, removeThread, clearThreads };
}

export type Conversations = ReturnType<typeof useConversations>;
