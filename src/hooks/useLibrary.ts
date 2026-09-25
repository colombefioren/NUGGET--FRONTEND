"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { usePersistentState } from "@/lib/storage";
import type { Health, LibraryDoc } from "@/lib/types";
import { isAccepted, uid } from "@/lib/utils";

export type Pending = { id: string; name: string };
type Notify = (text: string, tone?: "ok" | "error" | "info") => void;

/**
 * The API is the source of truth for documents; the list is mirrored in localStorage so
 * the library renders instantly on load and stays visible if the backend is briefly down.
 */
export function useLibrary(notify: Notify) {
  const { t } = useI18n();
  const [docs, setDocs, hydrated] = usePersistentState<LibraryDoc[]>("library", []);
  const [scope, setScope] = usePersistentState<string[] | null>("scope", null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [h, list] = await Promise.all([api.health(), api.documents()]);
      setHealth(h);
      setDocs(list);
      setOnline(true);
    } catch (err) {
      if (err instanceof ApiError && err.message === "offline") setOnline(false);
    }
  }, [setDocs]);

  useEffect(() => {
    if (!hydrated) return;
    refresh();
    const timer = window.setInterval(refresh, 30000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [hydrated, refresh]);

  // Drop ids from the scope once their document is gone.
  useEffect(() => {
    if (!scope) return;
    const ids = new Set(docs.map((d) => d.id));
    const kept = scope.filter((id) => ids.has(id));
    if (kept.length !== scope.length) setScope(kept.length === docs.length ? null : kept);
  }, [docs, scope, setScope]);

  const ingest = useCallback(
    async (name: string, run: () => Promise<{ document: LibraryDoc; duplicate: boolean }>) => {
      const id = uid();
      setPending((p) => [...p, { id, name }]);
      try {
        const { document, duplicate } = await run();
        setDocs((all) => [document, ...all.filter((d) => d.id !== document.id)]);
        // A newly added document joins an explicit selection so it's searchable right away.
        setScope((s) => (s && !s.includes(document.id) ? [...s, document.id] : s));
        notify(t(duplicate ? "toast.duplicate" : "toast.indexed", { name: document.name }), duplicate ? "info" : "ok");
        setOnline(true);
        return document;
      } catch (err) {
        const reason = err instanceof ApiError && err.message === "offline" ? t("error.offline") : String((err as Error).message);
        notify(t("toast.failed", { name, reason }), "error");
      } finally {
        setPending((p) => p.filter((x) => x.id !== id));
      }
    },
    [notify, setDocs, setScope, t],
  );

  const upload = useCallback(
    async (files: File[]) => {
      const accepted = files.filter((f) => {
        if (isAccepted(f.name)) return true;
        notify(t("toast.unsupported", { name: f.name }), "error");
        return false;
      });
      // Embedding is CPU-bound on the server, so files go through two at a time.
      const queue = [...accepted];
      const worker = async () => {
        for (let f = queue.shift(); f; f = queue.shift()) {
          const file = f;
          await ingest(file.name, () => api.uploadFile(file));
        }
      };
      await Promise.all([worker(), worker()]);
      refresh();
    },
    [ingest, notify, refresh, t],
  );

  const addText = useCallback(
    (text: string, title?: string) => ingest(title || text.slice(0, 40), () => api.uploadText(text, title)),
    [ingest],
  );

  const remove = useCallback(
    async (doc: LibraryDoc) => {
      setDocs((all) => all.filter((d) => d.id !== doc.id));
      try {
        await api.remove(doc.id);
        notify(t("toast.deleted", { name: doc.name }), "info");
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) {
          notify(t("toast.failed", { name: doc.name, reason: (err as Error).message }), "error");
          refresh();
        }
      }
    },
    [notify, refresh, setDocs, t],
  );

  const toggle = useCallback(
    (id: string) => {
      setScope((current) => {
        const selected = new Set(current ?? docs.map((d) => d.id));
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        return selected.size === docs.length ? null : [...selected];
      });
    },
    [docs, setScope],
  );

  const selected = scope === null ? docs.map((d) => d.id) : scope;

  return {
    docs,
    pending,
    health,
    online,
    scope,
    selected,
    setScope,
    toggle,
    upload,
    addText,
    remove,
    refresh,
  };
}

export type Library = ReturnType<typeof useLibrary>;
