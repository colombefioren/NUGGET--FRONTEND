"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Modal } from "./Modal";

export function PasteDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, title?: string) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text, title.trim() || undefined);
    setTitle("");
    setText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} label={t("paste.title")}>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="font-serif text-2xl">{t("paste.title")}</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("paste.name")}
          className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm placeholder:text-subtle focus:border-accent/60 focus:outline-none"
        />
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("paste.body")}
          rows={9}
          className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm leading-relaxed placeholder:text-subtle focus:border-accent/60 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2">
            {t("paste.cancel")}
          </button>
          <button type="submit" disabled={!text.trim()} className="btn-solid px-4 py-2">
            {t("paste.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
