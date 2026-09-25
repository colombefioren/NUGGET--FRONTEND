"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { usePersistentState } from "../storage";
import ar from "./ar";
import de from "./de";
import en, { type MessageKey, type Plural, type Translations } from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";
import ja from "./ja";
import pt from "./pt";
import zh from "./zh";

/** Labels are endonyms so every reader can find their own language. */
export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
] as const;
export type Locale = (typeof LOCALES)[number]["code"];

const dictionaries: Record<Locale, Translations> = { en, fr, es, de, pt, it, ja, zh, ar };
const RTL = new Set<string>(["ar"]);

type Vars = Record<string, string | number>;

type I18n = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
};

const I18nContext = createContext<I18n | null>(null);

function detect(): Locale {
  if (typeof navigator === "undefined") return "en";
  for (const lang of navigator.languages ?? [navigator.language]) {
    const base = lang.split("-")[0] as Locale;
    if (base in dictionaries) return base;
  }
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [stored, setLocale, hydrated] = usePersistentState<Locale | null>("locale", null);
  const locale: Locale = stored && stored in dictionaries ? stored : hydrated ? detect() : "en";
  const dir = RTL.has(locale) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = useCallback(
    (key: MessageKey, vars: Vars = {}) => {
      const entry = (dictionaries[locale][key] ?? en[key]) as string | Plural;
      let text: string;
      if (typeof entry === "string") text = entry;
      else {
        const rule = new Intl.PluralRules(locale).select(Number(vars.count ?? 0));
        text = entry[rule] ?? entry.other;
      }
      return text.replace(/\{(\w+)\}/g, (_, name) =>
        name in vars
          ? typeof vars[name] === "number"
            ? new Intl.NumberFormat(locale).format(vars[name] as number)
            : String(vars[name])
          : `{${name}}`,
      );
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]) as I18n;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
