import Link from "next/link";
import type { DigestItem } from "@/lib/viewmodel";

interface Props {
  item: DigestItem;
}

export default function SectionItem({ item }: Props) {
  return (
    <div className="ritem">
      <h3>
        {item.articleSlug ? (
          <Link href={"/articles/" + item.articleSlug}>{item.title}</Link>
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
      <p>{item.points}</p>
      {item.noteSlug && (
        <Link className="nt" href={"/notes/" + item.noteSlug}>
          📓 入門學習筆記 →
        </Link>
      )}
    </div>
  );
}
