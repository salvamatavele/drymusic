import { prisma } from "@/lib/db";
import { toPlaylistDTO } from "@/lib/serialize";
import { getVisitorId } from "@/lib/visitor";
import PlaylistsClient from "@/components/PlaylistsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Playlists" };

export default async function PlaylistsPage() {
  const visitorId = await getVisitorId();
  const playlists = await prisma.playlist.findMany({
    where: { visitorId: visitorId || "-" },
    include: {
      _count: { select: { items: true } },
      items: {
        where: { media: { cover: { not: null } } },
        orderBy: { position: "asc" },
        take: 1,
        select: { mediaId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PlaylistsClient
      initial={playlists.map((p) => toPlaylistDTO(p, p.items[0]?.mediaId ?? null))}
    />
  );
}
