export type Source = {
  id: string;
  doc_id: string;
  source: string;
  page: number | null;
  chunk: number;
  content: string;
  score: number;
  vector_score: number | null;
  keyword_rank: number | null;
};

export type Timings = {
  rewrite_ms: number;
  retrieval_ms: number;
  generation_ms: number;
};

export type LibraryDoc = {
  id: string;
  name: string;
  kind: string;
  chunks: number;
  chars: number;
  pages: number | null;
  created_at: string;
};

export type Chunk = {
  id: string;
  content: string;
  page: number | null;
  chunk: number;
};

export type Health = {
  status: string;
  documents: number;
  chunks: number;
  model: string;
  embedding_model: string;
  llm_configured: boolean;
};

export type Phase = "rewriting" | "searching" | "writing" | "done" | "error" | "stopped";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  sources?: Source[];
  searchQuery?: string;
  timings?: Timings;
  phase?: Phase;
  error?: string;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};
