// JSX renderer for /visit/from-<source> page bodies — markdown-lite.
//
// Sister of the pure-data helpers in `visit-from-source.ts`. Split out
// because Node's `--experimental-strip-types` cannot load `.tsx` from a
// test file. Tests import the pure-data helpers from
// `./visit-from-source` (which resolves to .ts); page files import the
// JSX renderer here.
//
// Renderer contract (sister of app/learn/[slug] renderer):
//   - `## ` → h2
//   - `- ` consecutive lines → ul + li
//   - blank-line-separated paragraphs → p
//   - `**bold**` inline → strong
//
// Re-exports the pure-data helpers so page files have a single import.

import type React from "react";

export {
  visitFromSourceUrl,
  visitFromSourceBreadcrumbLd,
  visitFromSourceArticleLd,
  visitFromSourceLocalBusinessLd,
  visitFromSourceStaticParams,
  visitFromSourceWslcbScan,
  type VisitFromSourceConfig,
} from "./visit-from-source.ts";

/** Renders the body string into a React fragment.
 *  - `## ` → h2
 *  - `- ` consecutive lines → ul
 *  - blank-line-separated paragraphs → p
 *  - `**bold**` inline. */
export function renderVisitFromSourceBody(body: string): React.ReactNode {
  const blocks: React.ReactNode[] = [];
  const lines = body.split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-6">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={`h2-${key++}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
