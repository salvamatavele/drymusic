import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toMediaDTO, toPlaylistDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import PlaylistDetailClient from "@/components/PlaylistDetailClient";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true } },
      items: {
        orderBy: { position: "asc" },
        include: { media: { include: { artist: true, album: true } } },
      },
    },
  });
  if (!playlist) notFound();

  const visitorId = await getVisitorId();
  const likedSet = await getLikedSet(visitorId);

  return (
    <PlaylistDetailClient
      playlist={toPlaylistDTO(playlist)}
      items={playlist.items.map((i) => toMediaDTO(i.media, likedSet))}
      isOwner={!!visitorId && playlist.visitorId === visitorId}
    />
  );
}
