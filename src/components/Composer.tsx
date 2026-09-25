"use client";

import { motion } from "motion/react";
import { ArrowUp, Layers, Paperclip, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { ACCEPTED_EXTENSIONS, cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onFiles: (files: File[]) => void;
  onScopeClick: () => void;
  busy: boolean;
  followUp: boolean;
  scopeLabel: string;
  blocked: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
};

export function Composer({ value, onChange, onSubmit, onStop, onFiles, onScopeClick, busy, followUp, scopeLabel, blocked, inputRef }: Props) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  // Grow with content up to a cap, then scroll.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value, inputRef]);

  const canSend = value.trim().length > 0 && !busy && !blocked;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
      className="rounded-2xl border border-line bg-raised shadow-sm transition-colors focus-within:border-accent/40"
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        dir="auto"
        rows={1}
        aria-label={t("composer.placeholder")}
        placeholder={followUp ? t("composer.placeholderFollowUp") : t("composer.placeholder")}
        className="block max-h-[220px] min-h-[3.25rem] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[0.975rem] leading-relaxed placeholder:text-subtle focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center gap-1 px-2 pb-2">
        <button type="button" className="icon-btn" title={t("composer.attach")} aria-label={t("composer.attach")} onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            // Reset so choosing the same file again still fires a change event.
            e.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
        <button
          type="button"
          onClick={onScopeClick}
          className={cn(
            "btn-ghost h-7 min-w-0 rounded-full border border-line px-2.5 text-xs",
            blocked && "border-danger/30 text-danger hover:text-danger",
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{blocked ?? scopeLabel}</span>
        </button>
        <span className="ms-auto hidden pe-1 font-mono text-2xs text-subtle lg:block">{t("composer.hint")}</span>
        {busy ? (
          <motion.button
            type="button"
            onClick={onStop}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="btn-solid h-9 w-9 shrink-0 rounded-full max-lg:ms-auto"
            aria-label={t("composer.stop")}
            title={t("composer.stop")}
          >
            <Square className="h-3 w-3 fill-current" />
          </motion.button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="btn-solid h-9 w-9 shrink-0 rounded-full max-lg:ms-auto"
            aria-label={t("composer.send")}
            title={t("composer.send")}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
