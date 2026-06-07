import { Suspense } from "react";
import { getSearchIndex } from "@/lib/queries";
import CatBrowser from "@/components/CatBrowser";

export const revalidate = 3600;

export default async function SectionsPage() {
  const rows = await getSearchIndex();

  return (
    <main className="wrap">
      <div className="feed-head">
        <h3>依分類瀏覽 · By Section</h3>
      </div>
      <Suspense>
        <CatBrowser rows={rows} />
      </Suspense>
    </main>
  );
}
