/* eslint-disable @next/next/no-img-element -- a tiny static PNG; next/image adds nothing here */
import { cn } from "@/lib/utils";

export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return <img src="/nugget.png" alt="" aria-hidden className={cn("select-none object-contain", className)} draggable={false} />;
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-fg">
      <LogoMark className="h-6 w-6" />
      <span className="text-[0.95rem] font-semibold tracking-tight">Nugget</span>
    </span>
  );
}
