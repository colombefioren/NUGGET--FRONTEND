"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageMenu() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="btn-ghost h-8 px-2 font-mono text-2xs uppercase"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
        title={t("language.label")}
        onClick={() => setOpen((o) => !o)}
      >
        <Languages className="h-3.5 w-3.5" />
        {locale}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t("language.label")}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.15 }}
            className="card absolute bottom-full end-0 z-50 mb-2 w-52 origin-bottom-right overflow-hidden p-1 shadow-md"
          >
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === locale}
                  lang={l.code}
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-start text-sm transition-colors hover:bg-sunken",
                    l.code === locale ? "text-accent" : "text-fg",
                  )}
                >
                  <span className="w-5 font-mono text-2xs uppercase text-subtle">{l.code}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.code === locale && <Check className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
