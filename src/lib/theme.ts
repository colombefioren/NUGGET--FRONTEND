"use client";

export type Theme = "light" | "dark";

const KEY = "nugget:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

let value: Theme = "light";
let hydrated = false;
let systemFollow = false;
const listeners = new Set<() => void>();

const media = () => window.matchMedia(DARK_QUERY);
const prefersDark = () => media().matches;
const emit = () => listeners.forEach((listener) => listener());

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function readStored(): "light" | "dark" | "system" | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed === "light" || parsed === "dark" || parsed === "system" ? parsed : null;
  } catch {
    return null;
  }
}

function resolve(stored: "light" | "dark" | "system" | null): Theme {
  return stored === "dark" || (stored === "system" && prefersDark()) ? "dark" : "light";
}

function onSystemChange() {
  if (!systemFollow) return;
  value = prefersDark() ? "dark" : "light";
  apply(value);
  emit();
}

export function hydrateTheme() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const stored = readStored();
  systemFollow = stored === "system";
  value = resolve(stored);
  apply(value);
  if (systemFollow) media().addEventListener("change", onSystemChange);
}

export const getTheme = () => value;

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function persist(theme: Theme): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(theme));
    return true;
  } catch {
    return false;
  }
}

export function setTheme(next: Theme) {
  systemFollow = false;
  media().removeEventListener("change", onSystemChange);
  value = next;
  apply(value);
  persist(next);
  emit();
}
