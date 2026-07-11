import type { ReactNode } from "react";

// 輕量 inline Markdown 渲染：只處理 **粗體**、*斜體*、`程式碼`。
// 無 dangerouslySetInnerHTML、無 hooks，可在 server component 直接使用。
// 以正規表達式切分為 React node 陣列；粗體/斜體內容遞迴解析（簡單巢狀）。
const PATTERN = /(`[^`]+`|\*\*.+?\*\*|\*[^*]+?\*)/;

function tokenize(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let i = 0;

  while (remaining.length > 0) {
    const m = remaining.match(PATTERN);
    if (!m || m.index === undefined) {
      nodes.push(remaining);
      break;
    }
    if (m.index > 0) {
      nodes.push(remaining.slice(0, m.index));
    }
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("`")) {
      nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      nodes.push(<strong key={key}>{tokenize(tok.slice(2, -2), key)}</strong>);
    } else {
      nodes.push(<em key={key}>{tokenize(tok.slice(1, -1), key)}</em>);
    }
    remaining = remaining.slice(m.index + tok.length);
  }

  return nodes;
}

export default function InlineMd({ text }: { text: string }) {
  return <>{tokenize(text, "im")}</>;
}
