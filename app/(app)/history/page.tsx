import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const visitorId = await getVisitorId();
  const [history, likedSet] = await Promise.all([
    prisma.playHistory.findMany({
      where: { visitorId: visitorId || "-" },
      include: { media: { include: { artist: true, album: true } } },
      orderBy: { playedAt: "desc" },
      take: 100,
    }),
    getLikedSet(visitorId),
  ]);

  // só a entrada mais recente de cada item
  const seen = new Set<string>();
  const items = history
    .filter((h) => {
      if (seen.has(h.mediaId)) return false;
      seen.add(h.mediaId);
      return true;
    })
    .map((h) => toMediaDTO(h.media, likedSet));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold md:text-3xl">Histórico</h1>
      <TrackList items={items} />
    </div>
  );
}
