import type { Metadata, Viewport } from "next";
import { Fredoka, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const display = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Nugget — ask your docs, get the nugget",
  description:
    "A multilingual retrieval-augmented answer engine. Drop in your files, ask in any language, get cited answers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8ec" },
    { media: "(prefers-color-scheme: dark)", color: "#14101e" },
  ],
};

// Applied before paint so a stored theme or language never flashes the default.
const bootScript = `try{var t=localStorage.getItem("nugget:theme");t=t?JSON.parse(t):"system";if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;var l=localStorage.getItem("nugget:locale");if(l){l=JSON.parse(l);document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr"}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
