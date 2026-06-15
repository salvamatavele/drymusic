import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import PlayAllButton from "@/components/PlayAllButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Músicas" };

export default async function MusicPage() {
  const [music, likedSet] = await Promise.all([
    prisma.media.findMany({
      where: { type: "MUSIC" },
      include: { artist: true, album: true },
      orderBy: { createdAt: "desc" },
    }),
    getVisitorId().then(getLikedSet),
  ]);
  const items = music.map((m) => toMediaDTO(m, likedSet));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Músicas</h1>
        <PlayAllButton items={items} />
      </div>
      <TrackList items={items} />
    </div>
  );
}
