import { getDigests } from "@/lib/queries";
import Hero from "@/components/Hero";
import CategoryStrip from "@/components/CategoryStrip";
import ArchiveGrid from "@/components/ArchiveGrid";

export const revalidate = 3600;

export default async function Home() {
  const digests = await getDigests();
  const today = digests[0];

  return (
    <main className="wrap">
      <Hero digest={today} />
      <CategoryStrip digest={today} />
      <ArchiveGrid digests={digests.slice(1)} />
    </main>
  );
}
