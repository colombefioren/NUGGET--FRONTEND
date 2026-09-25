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
        ink: token("ink"),
        accent: token("accent"),
        gold: token("gold"),
        butter: token("butter"),
        bubble: token("bubble"),
        mint: token("mint"),
        lilac: token("lilac"),
        sky: token("sky"),
        lime: token("lime"),
        onpastel: token("on-pastel"),
        ok: token("ok"),
        danger: token("danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-rounded", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        scan: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(400%)" } },
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(-4deg)" },
          "50%": { transform: "translateY(-8px) rotate(3deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-7deg)" },
          "75%": { transform: "rotate(7deg)" },
        },
        twinkle: {
          "0%, 100%": { transform: "scale(0.55) rotate(0deg)", opacity: "0.35" },
          "50%": { transform: "scale(1) rotate(45deg)", opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scan: "scan 1.2s cubic-bezier(.4,0,.2,1) infinite",
        bob: "bob 3.2s ease-in-out infinite",
        wiggle: "wiggle .45s ease-in-out",
        twinkle: "twinkle 2.4s ease-in-out infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--fg) / 0.9)",
            "--tw-prose-headings": "rgb(var(--fg))",
            "--tw-prose-bold": "rgb(var(--fg))",
            "--tw-prose-links": "rgb(var(--accent))",
            "--tw-prose-bullets": "rgb(var(--accent))",
            "--tw-prose-counters": "rgb(var(--accent))",
            "--tw-prose-quotes": "rgb(var(--muted))",
            "--tw-prose-quote-borders": "rgb(var(--accent))",
            "--tw-prose-code": "rgb(var(--on-pastel))",
            "--tw-prose-hr": "rgb(var(--ink) / 0.2)",
            "--tw-prose-th-borders": "rgb(var(--ink))",
            "--tw-prose-td-borders": "rgb(var(--ink) / 0.2)",
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
