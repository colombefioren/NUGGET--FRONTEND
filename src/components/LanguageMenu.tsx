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
        className="btn brut-sm press h-8 bg-mint px-2 font-mono text-2xs uppercase text-onpastel"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
        title={t("language.label")}
        onClick={() => setOpen((o) => !o)}
      >
        <Languages className="h-3.5 w-3.5" strokeWidth={2.5} />
        {locale}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t("language.label")}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="brut absolute bottom-full end-0 z-50 mb-3 w-52 origin-bottom-right overflow-hidden rounded-2xl bg-raised p-1.5"
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
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-start text-sm font-medium transition-colors hover:bg-butter hover:text-onpastel",
                    l.code === locale ? "bg-bubble text-onpastel" : "text-muted",
                  )}
                >
                  <span className="w-5 font-mono text-2xs font-bold uppercase opacity-60">{l.code}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.code === locale && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
