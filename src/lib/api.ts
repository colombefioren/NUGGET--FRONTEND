import type { Chunk, Health, LibraryDoc, Source, Timings } from "./types";

const BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** The Next proxy answers with a non-JSON 500 when the API process is down. */
async function toError(res: Response) {
  if (!res.headers.get("content-type")?.includes("json")) {
    return new ApiError(res.status >= 500 ? "offline" : res.statusText, res.status);
  }
  try {
    const body = await res.json();
    const detail = typeof body.detail === "string" ? body.detail : res.statusText;
    return new ApiError(detail, res.status);
  } catch {
    return new ApiError(res.statusText, res.status);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError("offline", 0);
  }
  if (!res.ok) throw await toError(res);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  health: () => request<Health>("/health"),
  documents: () => request<LibraryDoc[]>("/documents"),
  chunks: (id: string) => request<Chunk[]>(`/documents/${encodeURIComponent(id)}/chunks`),
  remove: (id: string) => request<void>(`/documents/${encodeURIComponent(id)}`, { method: "DELETE" }),
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ document: LibraryDoc; duplicate: boolean }>("/ingest/file", {
      method: "POST",
      body: form,
    });
  },
  uploadText: (text: string, title?: string) =>
    request<{ document: LibraryDoc; duplicate: boolean }>("/ingest/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, title }),
    }),
};

export type StreamHandlers = {
  onSources: (data: { sources: Source[]; search_query: string; timings: Timings }) => void;
  onToken: (token: string) => void;
  onDone: (data: { timings: Timings }) => void;
  onError: (detail: string) => void;
};

export type QueryPayload = {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  doc_ids: string[] | null;
  locale: string;
};

/** POSTs a question and parses the server-sent event stream by hand (EventSource is GET-only). */
export async function streamQuery(payload: QueryPayload, handlers: StreamHandlers, signal: AbortSignal) {
  let res: Response;
  try {
    res = await fetch(`${BASE}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (signal.aborted) return;
    throw err instanceof Error ? new ApiError("offline", 0) : err;
  }
  if (!res.ok || !res.body) {
    handlers.onError((await toError(res)).message);
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        let event = "message";
        let data = "";
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trimStart();
        }
        if (!data) continue;
        const parsed = JSON.parse(data);
        if (event === "sources") handlers.onSources(parsed);
        else if (event === "token") handlers.onToken(parsed);
        else if (event === "done") handlers.onDone(parsed);
        else if (event === "error") handlers.onError(parsed.detail);
      }
    }
  } catch (err) {
    if (!signal.aborted) throw err;
  }
}
