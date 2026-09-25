/* eslint-disable @next/next/no-img-element -- a tiny static PNG; next/image adds nothing here */
import { cn } from "@/lib/utils";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return <img src="/nugget.png" alt="" aria-hidden className={cn("select-none object-contain", className)} draggable={false} />;
}

export function Logo() {
  return (
    <span className="group flex items-center gap-2 text-fg">
      <LogoMark className="h-8 w-8 transition-transform group-hover:animate-wiggle" />
      <span className="font-display text-xl font-bold uppercase tracking-[0.22em]">Nugget</span>
    </span>
  );
}

/** Four-point sparkle used as decoration around the mascot. */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 0c.9 6.6 5.4 11.1 12 12-6.6.9-11.1 5.4-12 12-.9-6.6-5.4-11.1-12-12C6.6 11.1 11.1 6.6 12 0Z" fill="currentColor" />
    </svg>
  );
}
