"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import { cn, linkCitations } from "@/lib/utils";

// CommonMark refuses **bold** next to CJK punctuation; the CJK plugin relaxes that rule.
const PLUGINS = [remarkGfm, remarkCjkFriendly];

type Props = {
  text: string;
  streaming?: boolean;
  renderCitation: (n: number) => React.ReactNode;
};

function MarkdownImpl({ text, streaming, renderCitation }: Props) {
  const components: Components = {
    a({ href, children, ...rest }) {
      const match = href?.match(/^#cite-(\d+)$/);
      if (match) return renderCitation(Number(match[1]));
      return (
        <a href={href} target="_blank" rel="noreferrer" {...rest}>
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="-mx-1 overflow-x-auto px-1">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <div
      className={cn(
        "prose max-w-none text-[0.975rem] leading-[1.75] prose-p:my-3 prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-li:my-1 prose-code:rounded prose-code:bg-sunken prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-pre:border prose-pre:border-line prose-table:text-sm",
        streaming && "streaming",
      )}
    >
      <ReactMarkdown remarkPlugins={PLUGINS} components={components}>
        {linkCitations(text)}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(MarkdownImpl);
