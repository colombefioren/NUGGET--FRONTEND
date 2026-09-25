export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2.75a9.25 9.25 0 0 1 9.25 9.25" fill="none" stroke="rgb(var(--accent))" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15.5" cy="8.5" r="2.25" fill="rgb(var(--accent))" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-fg">
      <LogoMark />
      <span className="font-serif text-[1.6rem] leading-none tracking-tight">Nugget</span>
    </span>
  );
}
