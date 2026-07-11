"use client";

import {
  createElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import "../app/markdown.css";

/* ============================================================
   共用 Markdown 渲染元件（Spec 006 §3.3）
   - Mermaid：瀏覽器端 render（dynamic import，不進首頁/日報頁 bundle）
   - Obsidian callout：[!type] 標題美化
   - [[wikilink]]：轉成站內連結（前處理）
   主題：跟隨 <html data-theme="light"|"dark">（同 ThemeToggle），
   亮 → mermaid "default"，暗 → mermaid "dark"，切主題重繪。
   ============================================================ */

// ── 主題讀取（與 ThemeToggle / layout 防閃爍 script 完全一致） ──
function readMermaidTheme(): "default" | "dark" {
  if (typeof document === "undefined") return "default";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "default";
}

// ── Mermaid 圖（瀏覽器端 render，失敗 fallback 原始碼） ──
function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId();
  // useId 會含冒號等非法 CSS id 字元，mermaid id 需可作為 SVG id，故 sanitize。
  const id = "mmd-" + rawId.replace(/[^a-zA-Z0-9-]/g, "");
  // 每次 render 用遞增後綴產生唯一 id —— 主題切換重繪時，若沿用同一 id，
  // mermaid v11 會因「svg id 已存在」拋錯導致圖消失。seq 確保每次 id 唯一。
  const seq = useRef(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const theme = readMermaidTheme();
        mermaid.initialize({ startOnLoad: false, theme });
        const renderId = id + "-" + seq.current++;
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setFailed(false);
        }
      } catch {
        // 失敗時把原始碼塞回容器（即使 failed state 在 observer 重繪路徑下不重掛元件）。
        if (!cancelled && ref.current) {
          ref.current.textContent = chart;
        }
        if (!cancelled) setFailed(true);
      }
    }

    render();

    // 監聽 <html data-theme> 變化 → 重繪。
    const observer = new MutationObserver(() => {
      render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // chart / id 穩定，effect 只需跑一次（observer 處理主題重繪）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="mermaid-fallback">
        <code>{chart}</code>
      </pre>
    );
  }

  return <div className="mermaid-diagram" ref={ref} />;
}

// ── react-markdown 自訂 renderer ──
const components: Components = {
  code(props) {
    // 去掉 react-markdown 注入的 hast `node`，避免傳進 DOM 元素。
    const { node, className, children, ...rest } = props;
    void node;
    const cls = className ?? "";
    if (/\blanguage-mermaid\b/.test(cls)) {
      const chart = String(children ?? "").replace(/\n$/, "");
      return <MermaidDiagram chart={chart} />;
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },

  blockquote(props) {
    const { node, children, ...rest } = props;
    void node;
    const parsed = extractCallout(children);
    if (!parsed) {
      return <blockquote {...rest}>{children}</blockquote>;
    }
    const { type, title, content } = parsed;
    return (
      <div className={"callout callout-" + type}>
        <div className="callout-title">{title || type.toUpperCase()}</div>
        <div className="callout-body">{content}</div>
      </div>
    );
  },

  // 外部連結（http/https）另開分頁並加 rel；站內連結維持預設行為，與手寫連結一致。
  a(props) {
    const { node, href, children, ...rest } = props;
    void node;
    const isExternal =
      typeof href === "string" && /^https?:\/\//i.test(href);
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },

  // 寬表格包一層可橫向捲動容器，避免撐破 760px reader。
  table(props) {
    const { node, children, ...rest } = props;
    void node;
    return (
      <div className="table-wrap">
        <table {...rest}>{children}</table>
      </div>
    );
  },
};

// ── Obsidian callout 解析 ──
// 標記出現在 blockquote 第一個子元素（通常是 <p>）的開頭文字，形如：
//   [!info] 可選標題
// 回傳 type / title，並回傳「移除標記後」的 children 供渲染。
function extractCallout(
  children: React.ReactNode
):
  | { type: string; title: string; content: React.ReactNode }
  | null {
  const arr = Array.isArray(children) ? [...children] : [children];

  // 找到第一個帶有文字內容的子節點（跳過純空白文字節點）。
  let firstIdx = -1;
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (typeof c === "string" && c.trim() === "") continue;
    firstIdx = i;
    break;
  }
  if (firstIdx === -1) return null;

  const first = arr[firstIdx];
  if (!isElementWithChildren(first)) return null;

  const innerChildren = first.props.children;
  const innerArr = Array.isArray(innerChildren)
    ? [...innerChildren]
    : [innerChildren];

  // 首個 inner child 必須是字串且以 [!type] 開頭。
  const leading = innerArr[0];
  if (typeof leading !== "string") return null;

  // marker 行：[!type] 後接可選標題（至該行結束）。若同一文字節點內以軟換行接續
  // 內文（Obsidian 常見寫法：標題與正文各一行、其間無空行 → 收斂成同一 <p>），
  // 需把第一行當標題、\n 之後留為 body。舊版正則 `(.*)$`（無 m 旗標且 `.` 不跨行）
  // 遇此軟換行即整段失配 → callout 原樣顯示（本次修復點：[!abstract] 一句話理解…）。
  const match = leading.match(
    /^\s*\[!([A-Za-z]+)\][ \t]*([^\n]*)(?:\n([\s\S]*))?$/
  );
  if (!match) return null;

  const type = match[1].toLowerCase();
  // 標題：marker 同一行剩餘文字（trim 後若空則以 type 當標題）。
  const title = match[2].trim();
  // body 起始：marker 行之後（同節點軟換行）的文字，回填首段供正常渲染。
  const bodyRemainder = match[3] ?? "";

  const newInner = [...innerArr];
  newInner[0] = bodyRemainder;
  const allBlank = newInner.every(
    (c) => typeof c === "string" && c.trim() === ""
  );

  const newArr = [...arr];
  if (allBlank) {
    // 首段只剩 marker（無同段內文）→ 整段移除，避免殘留空 <p>。
    newArr.splice(firstIdx, 1);
  } else {
    // 首段 marker 同段尚有內文（軟換行）→ 保留其餘內文為 body。
    newArr[firstIdx] = cloneWithChildren(first, newInner);
  }

  return { type, title, content: newArr };
}

// ── 型別守衛 / 工具 ──
type ElWithChildren = React.ReactElement<{ children?: React.ReactNode }>;

function isElementWithChildren(node: React.ReactNode): node is ElWithChildren {
  return isValidElement(node);
}

function cloneWithChildren(
  el: ElWithChildren,
  children: React.ReactNode
): React.ReactElement {
  return createElement(el.type, { ...el.props, key: "callout-first" }, children);
}

// ── Wikilink 前處理：[[target]] / [[target|label]] → Markdown 連結 ──
// 路由啟發：target 含「學習」(含 -學習-) → /notes/<target>，否則 /articles/<target>。
// 顯示 label（| 後）若有，否則顯示 target。href 用原始 target（Next 自行編碼）。
function transformWikilinks(src: string): string {
  return src.replace(/\[\[([^\]]+)\]\]/g, (_full, inner: string) => {
    const [rawTarget, rawLabel] = inner.split("|");
    const target = rawTarget.trim();
    const label = (rawLabel ?? rawTarget).trim();
    const base = target.includes("學習") ? "/notes/" : "/articles/";
    return `[${label}](${base}${target})`;
  });
}

// ── 內部連結目的地含未編碼空白 ──
// [標題](/articles/2026-05-25-Google Gemini Omni …) 的空白使 CommonMark 不視為連結，
// 原始碼直接顯示。將 ](...) 群組內的空白 percent-encode 讓其正常解析。沿用 wikilink
// 前處理的單純 replace 策略（不特別剖析 fenced code；此類站內路徑不會出現於程式碼區塊）。
// 置於 transformWikilinks 之後，順帶修正 wikilink 產生、target 含空白的連結。
function encodeLinkSpaces(src: string): string {
  return src.replace(/\]\(([^)\n]*)\)/g, (full, dest: string) => {
    if (!dest.includes(" ")) return full;
    return "](" + dest.replace(/ /g, "%20") + ")";
  });
}

// ── 去除與頁面標題重複的 body 開頭 H1 ──
// 筆記/文章頁 header 已有 <h1>，body 第一行常是同名 `# 標題` → 連續重複。
// 僅當 body 第一個非空行是與 dedupeTitle 正規化後相等的 H1 時移除；否則不動。
function normalizeHeading(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
function stripDuplicateH1(src: string, dedupeTitle: string): string {
  const target = normalizeHeading(dedupeTitle);
  if (!target) return src;
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") continue; // 跳過開頭空行
    const m = lines[i].match(/^#\s+(.*)$/);
    if (m && normalizeHeading(m[1]) === target) {
      lines.splice(i, 1);
      // 順帶移除緊接的空行，避免留下多餘間距。
      if (lines[i] !== undefined && lines[i].trim() === "") lines.splice(i, 1);
    }
    break; // 僅檢查第一個非空行（body 開頭 H1）
  }
  return lines.join("\n");
}

export default function MarkdownView({
  content,
  dedupeTitle,
}: {
  content: string;
  dedupeTitle?: string;
}) {
  let processed = dedupeTitle
    ? stripDuplicateH1(content, dedupeTitle)
    : content;
  processed = transformWikilinks(processed);
  processed = encodeLinkSpaces(processed);
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {processed}
    </Markdown>
  );
}
