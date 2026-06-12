import { Heart } from "lucide-react";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import PlayAllButton from "@/components/PlayAllButton";

export const dynamic = "force-dynamic";

export default async function LikedPage() {
  const visitorId = await getVisitorId();
  const likes = await prisma.like.findMany({
    where: { visitorId: visitorId || "-" },
    include: { media: { include: { artist: true, album: true } } },
    orderBy: { createdAt: "desc" },
  });
  const likedSet = new Set(likes.map((l) => l.mediaId));
  const items = likes.map((l) => toMediaDTO(l.media, likedSet));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5 rounded-xl bg-gradient-to-b from-indigo-700/60 to-transparent p-6">
        <span className="flex size-28 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-accent shadow-2xl md:size-36">
          <Heart className="size-12 fill-white text-white" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Playlist</p>
          <h1 className="text-3xl font-extrabold md:text-5xl">Favoritos</h1>
          <p className="mt-1 text-sm text-muted">{items.length} itens</p>
        </div>
      </header>
      <div className="flex items-center gap-4">
        <PlayAllButton items={items} />
      </div>
      <TrackList items={items} />
    </div>
  );
}
