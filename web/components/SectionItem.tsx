import Link from "next/link";
import type { DigestItem } from "@/lib/viewmodel";
import { articleUrl, noteUrl } from "@/lib/routes";
import InlineMd from "./InlineMd";

interface Props {
  item: DigestItem;
}

export default function SectionItem({ item }: Props) {
  return (
    <div className="ritem">
      <h3>
        {item.articleSlug ? (
          <Link href={articleUrl(item.articleSlug)}>{item.title}</Link>
        ) : (
          item.title
        )}
      </h3>
      <div className="rim">
        <span className="src">{item.source}</span>
        {item.industry !== null && (
          <span className="ind">{item.industry}</span>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            原文 ↗
          </a>
        )}
      </div>
      <p><InlineMd text={item.points} /></p>
      {item.noteSlug && (
        <Link className="nt" href={noteUrl(item.noteSlug)}>
          📓 入門學習筆記 →
        </Link>
      )}
    </div>
  );
}
