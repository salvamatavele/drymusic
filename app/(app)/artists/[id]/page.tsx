import { notFound } from "next/navigation";
import Link from "next/link";
import { MicVocal } from "lucide-react";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import TrackList from "@/components/TrackList";
import MediaGrid from "@/components/MediaGrid";
import PlayAllButton from "@/components/PlayAllButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) return { title: "Artista" };
  return {
    title: artist.name,
    description: `Ouve as músicas e vídeos de ${artist.name} no DryMusic.`,
    alternates: { canonical: `/artists/${id}` },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      media: {
        include: { artist: true, album: true },
        orderBy: { playCount: "desc" },
      },
      albums: { include: { _count: { select: { media: true } } } },
    },
  });
  if (!artist) notFound();

  const likedSet = await getVisitorId().then(getLikedSet);
  const music = artist.media
    .filter((m) => m.type === "MUSIC")
    .map((m) => toMediaDTO(m, likedSet));
  const videos = artist.media
    .filter((m) => m.type === "VIDEO")
    .map((m) => toMediaDTO(m, likedSet));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5 rounded-xl bg-gradient-to-b from-emerald-800/60 to-transparent p-6">
        <span className="flex size-28 items-center justify-center rounded-full bg-elevated shadow-2xl md:size-36">
          <MicVocal className="size-12 text-muted" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Artista</p>
          <h1 className="text-3xl font-extrabold md:text-5xl">{artist.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {music.length} músicas • {videos.length} vídeos
          </p>
        </div>
      </header>

      <div className="flex items-center gap-4">
        <PlayAllButton items={[...music, ...videos]} />
      </div>

      {artist.albums.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Álbuns</h2>
          <div className="flex flex-wrap gap-3">
            {artist.albums.map((al) => (
              <Link
                key={al.id}
                href={`/albums/${al.id}`}
                className="rounded-full bg-surface px-4 py-2 text-sm font-medium hover:bg-elevated transition"
              >
                {al.title}
                <span className="text-muted"> • {al._count.media}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {music.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Populares</h2>
          <TrackList items={music} />
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Vídeos</h2>
          <MediaGrid items={videos} video />
        </section>
      )}
    </div>
  );
}
