"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Upload, Send, FileText, Loader2, Database } from "lucide-react";

type Source = {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
};

type Result = {
  answer: string;
  sources: Source[];
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<number | null>(null);

  async function refreshHealth() {
    try {
      const res = await fetch("http://localhost:8000/health");
      const data = await res.json();
      setDocs(data.docs);
    } catch {
      setDocs(null);
    }
  }

  async function handleQuery(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Query failed");
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    setIngesting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:8000/ingest/file", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Ingest failed");
      await refreshHealth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <header className="animate-fade-up mb-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60">
          <Sparkles className="h-3.5 w-3.5 text-glow" />
          Retrieval-Augmented Generation
        </div>
        <h1 className="text-5xl font-semibold tracking-tight">
          <span className="text-gradient">Lumen</span>
        </h1>
        <p className="mt-4 text-white/50">
          Ask your documents. Get grounded, cited answers.
        </p>
      </header>

      <div className="animate-fade-up mb-8 grid grid-cols-3 gap-3" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Docs indexed", value: docs ?? "—", icon: Database },
          { label: "Model", value: "gpt-4o-mini", icon: Sparkles },
          { label: "Store", value: "Chroma", icon: FileText },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <s.icon className="mb-2 h-4 w-4 text-mint" />
            <div className="text-lg font-medium">{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "140ms" }}>
        <label className="glass group mb-6 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-dashed p-8 transition hover:border-glow/40">
          <Upload className="h-5 w-5 text-white/40 transition group-hover:text-glow" />
          <span className="text-sm text-white/50">
            {ingesting ? "Ingesting…" : "Drop a PDF or text file to index"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.csv,.json"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>

        <form onSubmit={handleQuery} className="glass rounded-3xl p-2 focus-within:border-glow/40">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleQuery(e);
              }
            }}
            placeholder="Ask anything about your documents…"
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-3 text-lg placeholder:text-white/30 focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs text-white/30">Enter to send · Shift+Enter for newline</span>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 rounded-xl bg-glow px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-30"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="animate-fade-up mt-6 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm text-ember">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-up mt-8 space-y-6">
          <div className="glass rounded-3xl p-6">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-mint">
              <Sparkles className="h-3.5 w-3.5" /> Answer
            </div>
            <div className="prose prose-invert max-w-none text-white/80">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {result.sources.length > 0 && (
            <div>
              <div className="mb-3 text-xs uppercase tracking-wider text-white/40">
                Sources ({result.sources.length})
              </div>
              <div className="space-y-3">
                {result.sources.map((s, i) => (
                  <details key={i} className="glass group rounded-2xl p-4">
                    <summary className="flex cursor-pointer items-center justify-between text-sm text-white/70">
                      <span className="truncate">
                        {String(s.metadata.source ?? `Chunk ${i + 1}`)}
                      </span>
                      <span className="ml-3 rounded-full bg-white/5 px-2 py-0.5 text-xs text-mint">
                        {(s.score * 100).toFixed(0)}%
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{s.content}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}