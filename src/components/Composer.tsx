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
      className="brut relative rounded-3xl bg-raised transition-transform focus-within:-translate-y-0.5"
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
        className="block max-h-[220px] min-h-[3.25rem] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-base leading-relaxed placeholder:text-subtle focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center gap-2 px-3 pb-3">
        <button type="button" className="icon-btn h-8 w-8 bg-butter text-onpastel" title={t("composer.attach")} aria-label={t("composer.attach")} onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-4 w-4" strokeWidth={2.5} />
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
            "btn brut-sm press h-8 min-w-0 rounded-full bg-sky px-3 text-xs text-onpastel",
            blocked && "bg-bubble",
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
            initial={{ scale: 0.6, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="btn brut-sm press h-10 w-10 shrink-0 rounded-full bg-fg text-bg max-lg:ms-auto"
            aria-label={t("composer.stop")}
            title={t("composer.stop")}
          >
            <Square className="h-3 w-3 fill-current" />
          </motion.button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="btn brut-sm press h-10 w-10 shrink-0 rounded-full bg-accent text-white max-lg:ms-auto"
            aria-label={t("composer.send")}
            title={t("composer.send")}
          >
            <ArrowUp className="h-5 w-5" strokeWidth={3} />
          </button>
        )}
      </div>
    </form>
  );
}
