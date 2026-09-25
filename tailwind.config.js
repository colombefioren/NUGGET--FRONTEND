/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        raised: token("raised"),
        sunken: token("sunken"),
        fg: token("fg"),
        muted: token("muted"),
        subtle: token("subtle"),
        line: token("line"),
        accent: token("accent"),
        ok: token("ok"),
        danger: token("danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        lift: "0 1px 0 rgb(var(--line) / 0.6), 0 12px 32px -12px rgb(0 0 0 / 0.18)",
        pop: "0 24px 64px -16px rgb(0 0 0 / 0.35)",
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        scan: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(400%)" } },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scan: "scan 1.4s cubic-bezier(.4,0,.2,1) infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--fg) / 0.88)",
            "--tw-prose-headings": "rgb(var(--fg))",
            "--tw-prose-bold": "rgb(var(--fg))",
            "--tw-prose-links": "rgb(var(--accent))",
            "--tw-prose-bullets": "rgb(var(--subtle))",
            "--tw-prose-counters": "rgb(var(--subtle))",
            "--tw-prose-quotes": "rgb(var(--muted))",
            "--tw-prose-quote-borders": "rgb(var(--accent) / 0.5)",
            "--tw-prose-code": "rgb(var(--fg))",
            "--tw-prose-hr": "rgb(var(--line))",
            "--tw-prose-th-borders": "rgb(var(--line))",
            "--tw-prose-td-borders": "rgb(var(--line) / 0.6)",
            "--tw-prose-pre-bg": "rgb(var(--sunken))",
            "--tw-prose-pre-code": "rgb(var(--fg))",
            "code::before": { content: "none" },
            "code::after": { content: "none" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
