import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumen — RAG Answer Engine",
  description: "Ask your documents. Get grounded answers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}