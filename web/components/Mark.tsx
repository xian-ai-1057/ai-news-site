import { Fragment } from "react";

interface MarkProps {
  text: string;
  q: string;
}

/** escape regex 特殊字元，讓查詢字串可安全當作 pattern。 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 以 case-insensitive 切分 text，命中片段包 <mark>。
 * q 為空（或 trim 後為空）回傳原文。與 overlay / catView 共用。
 */
export default function Mark({ text, q }: MarkProps) {
  const query = q.trim();
  if (!query) return <>{text}</>;

  const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(re);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i}>{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
