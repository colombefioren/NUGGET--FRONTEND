"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { getTheme, hydrateTheme, setTheme, subscribeTheme } from "@/lib/theme";

const serverTheme = () => "light" as const;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeToggle() {
  const { t } = useI18n();
  const theme = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);

  useIsoLayoutEffect(() => {
    hydrateTheme();
  }, []);

  const label = t(`theme.${theme}`);
  return (
    <button
      type="button"
      className="icon-btn h-8 w-8 bg-lilac text-onpastel"
      title={label}
      aria-label={label}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 dark:hidden" strokeWidth={2.5} />
      <Moon className="hidden h-4 w-4 dark:block" strokeWidth={2.5} />
    </button>
  );
}
