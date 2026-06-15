import { notFound } from "next/navigation";
import { Disc3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import PlayAllButton from "@/components/PlayAllButton";
import CollectionCover from "@/components/CollectionCover";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!album) return { title: "Álbum" };
  return {
    title: album.artist ? `${album.title} — ${album.artist.name}` : album.title,
    description: `Ouve o álbum ${album.title} no DryMusic.`,
    alternates: { canonical: `/albums/${id}` },
  };
}

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
  const coverId = items.find((i) => i.hasCover)?.id ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5 rounded-xl bg-gradient-to-b from-rose-900/60 to-transparent p-6">
        <CollectionCover
          mediaId={coverId}
          icon={Disc3}
          alt={album.title}
          className="size-28 rounded-lg shadow-2xl md:size-36"
        />
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
