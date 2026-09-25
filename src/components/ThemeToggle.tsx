"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { usePersistentState } from "@/lib/storage";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon };

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = usePersistentState<Theme>("theme", "system");

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const Icon = ICONS[theme];
  const label = t(`theme.${theme}`);
  return (
    <button
      type="button"
      className="icon-btn h-8 w-8 bg-lilac text-onpastel"
      title={label}
      aria-label={label}
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}
