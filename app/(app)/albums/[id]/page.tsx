import { notFound } from "next/navigation";
import { Disc3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import PlayAllButton from "@/components/PlayAllButton";

export const dynamic = "force-dynamic";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      artist: true,
      media: {
        include: { artist: true, album: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!album) notFound();

  const likedSet = await getVisitorId().then(getLikedSet);
  const items = album.media.map((m) => toMediaDTO(m, likedSet));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5 rounded-xl bg-gradient-to-b from-rose-900/60 to-transparent p-6">
        <span className="flex size-28 items-center justify-center rounded-lg bg-elevated shadow-2xl md:size-36">
          <Disc3 className="size-12 text-muted" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Álbum</p>
          <h1 className="text-3xl font-extrabold md:text-5xl">{album.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {album.artist?.name ?? "Vários"} • {items.length} faixas
          </p>
        </div>
      </header>
      <div className="flex items-center gap-4">
        <PlayAllButton items={items} />
      </div>
      <TrackList items={items} />
    </div>
  );
}
