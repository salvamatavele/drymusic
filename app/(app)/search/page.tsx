import Link from "next/link";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import MediaGrid from "@/components/MediaGrid";
import SearchInput from "@/components/SearchInput";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pesquisar" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const visitorId = await getVisitorId();
  const likedSet = await getLikedSet(visitorId);

  const [music, videos, artists, albums, playlists] = query
    ? await Promise.all([
        prisma.media.findMany({
          where: {
            type: "MUSIC",
            OR: [
              { title: { contains: query } },
              { artist: { name: { contains: query } } },
              { album: { title: { contains: query } } },
            ],
          },
          include: { artist: true, album: true },
          take: 20,
        }),
        prisma.media.findMany({
          where: { type: "VIDEO", title: { contains: query } },
          include: { artist: true, album: true },
          take: 12,
        }),
        prisma.artist.findMany({
          where: { name: { contains: query } },
          take: 8,
        }),
        prisma.album.findMany({
          where: { title: { contains: query } },
          include: { artist: true },
          take: 8,
        }),
        prisma.playlist.findMany({
          where: { name: { contains: query }, visitorId: visitorId || "-" },
          include: { _count: { select: { items: true } } },
          take: 8,
        }),
      ])
    : [[], [], [], [], []];

  const nothing =
    query &&
    !music.length &&
    !videos.length &&
    !artists.length &&
    !albums.length &&
    !playlists.length;

  return (
    <div className="flex flex-col gap-6">
      <SearchInput initial={query} />

      {nothing && (
        <p className="py-8 text-center text-muted">
          Sem resultados para “{query}”.
        </p>
      )}

      {artists.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Artistas</h2>
          <div className="flex flex-wrap gap-3">
            {artists.map((a) => (
              <Link
                key={a.id}
                href={`/artists/${a.id}`}
                className="rounded-full bg-surface px-4 py-2 text-sm font-medium hover:bg-elevated transition"
              >
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Álbuns</h2>
          <div className="flex flex-wrap gap-3">
            {albums.map((al) => (
              <Link
                key={al.id}
                href={`/albums/${al.id}`}
                className="rounded-full bg-surface px-4 py-2 text-sm font-medium hover:bg-elevated transition"
              >
                {al.title}
                {al.artist ? (
                  <span className="text-muted"> • {al.artist.name}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Playlists</h2>
          <div className="flex flex-wrap gap-3">
            {playlists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlists/${pl.id}`}
                className="rounded-full bg-surface px-4 py-2 text-sm font-medium hover:bg-elevated transition"
              >
                {pl.name}
                <span className="text-muted"> • {pl._count.items}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {music.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Músicas</h2>
          <TrackList items={music.map((m) => toMediaDTO(m, likedSet))} />
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Vídeos</h2>
          <MediaGrid items={videos.map((m) => toMediaDTO(m, likedSet))} video />
        </section>
      )}
    </div>
  );
}
