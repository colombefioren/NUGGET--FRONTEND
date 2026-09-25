import clsx, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export function formatCount(n: number, locale: string) {
  return new Intl.NumberFormat(locale, { notation: n >= 10000 ? "compact" : "standard" }).format(n);
}

export function relativeTime(ts: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff = (ts - Date.now()) / 1000;
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "year";
  let div = 31557600;
  for (const [limit, u] of steps) {
    if (Math.abs(diff) < limit) {
      unit = u;
      break;
    }
    div = limit;
  }
  const divisor = unit === "second" ? 1 : div;
  return rtf.format(Math.round(diff / divisor), unit);
}

export const ACCEPTED_EXTENSIONS = [
  "pdf", "docx", "txt", "md", "markdown", "csv", "tsv", "json", "html", "htm", "xml", "yaml", "yml", "rst", "log",
];

export const isAccepted = (name: string) =>
  ACCEPTED_EXTENSIONS.includes(name.split(".").pop()?.toLowerCase() ?? "");

/** Turns bare [n] markers into links the Markdown renderer can intercept as citations. */
export function linkCitations(text: string) {
  return text.replace(/\[(\d{1,2})\](?!\(|:)/g, "[$1](#cite-$1)");
}

/** Wraps query terms in <mark> for source excerpts; skips short stop-like tokens. */
export function highlightTerms(text: string, query: string) {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 3),
    ),
  );
  if (!terms.length) return [{ text, hit: false }];
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Whole words only, so "build" doesn't light up the middle of "building".
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join("|")})(?![\\p{L}\\p{N}])`, "giu");
  return text.split(re).map((part) => ({ text: part, hit: terms.includes(part.toLowerCase()) }));
}

/** Strips the Markdown syntax that makes raw chunks noisy in short previews. */
export function plainText(md: string) {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*\|?\s*-{3,}.*$/gm, "")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/(\*\*|__|`)/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drops the text a chunk repeats from its predecessor (splitter overlap) for continuous reading. */
export function trimOverlap(prev: string, next: string) {
  for (let k = Math.min(prev.length, next.length, 600); k > 12; k--) {
    if (prev.endsWith(next.slice(0, k))) return next.slice(k).trimStart();
  }
  return next;
}
