import Link from "next/link";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import MediaGrid from "@/components/MediaGrid";
import TrackList from "@/components/TrackList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const visitorId = await getVisitorId();
  const [recentMusic, recentVideos, topPlayed, recentHistory, likedSet] =
    await Promise.all([
      prisma.media.findMany({
        where: { type: "MUSIC" },
        include: { artist: true, album: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.media.findMany({
        where: { type: "VIDEO" },
        include: { artist: true, album: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.media.findMany({
        where: { playCount: { gt: 0 } },
        include: { artist: true, album: true },
        orderBy: { playCount: "desc" },
        take: 8,
      }),
      prisma.playHistory.findMany({
        where: { visitorId: visitorId || "-" },
        include: { media: { include: { artist: true, album: true } } },
        orderBy: { playedAt: "desc" },
        take: 24,
      }),
      getLikedSet(visitorId),
    ]);

  // só a entrada mais recente de cada item tocado por este visitante
  const seen = new Set<string>();
  const recentlyPlayed = recentHistory
    .filter((h) => {
      if (seen.has(h.mediaId)) return false;
      seen.add(h.mediaId);
      return true;
    })
    .slice(0, 6)
    .map((h) => h.media);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Boa noite";
    if (h < 13) return "Bom dia";
    if (h < 20) return "Boa tarde";
    return "Boa noite";
  })();

  const empty =
    !recentMusic.length && !recentVideos.length && !recentlyPlayed.length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold md:text-3xl">{greeting}</h1>

      {empty && (
        <div className="rounded-xl bg-surface p-8 text-center">
          <p className="text-lg font-semibold">A tua biblioteca está vazia</p>
          <p className="mt-1 text-sm text-muted">
            Começa por enviar as tuas músicas e vídeos.
          </p>
          <Link
            href="/admin/upload"
            className="mt-4 inline-block rounded-full bg-accent px-6 py-2 font-bold text-black hover:bg-accent-hover transition"
          >
            Fazer upload
          </Link>
        </div>
      )}

      {recentlyPlayed.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Tocados recentemente</h2>
            <Link href="/history" className="text-sm text-muted hover:text-white">
              Ver tudo
            </Link>
          </div>
          <TrackList items={recentlyPlayed.map((m) => toMediaDTO(m, likedSet))} />
        </section>
      )}

      {recentMusic.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Músicas recentes</h2>
            <Link href="/music" className="text-sm text-muted hover:text-white">
              Ver tudo
            </Link>
          </div>
          <MediaGrid items={recentMusic.map((m) => toMediaDTO(m, likedSet))} />
        </section>
      )}

      {recentVideos.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Vídeos recentes</h2>
            <Link href="/videos" className="text-sm text-muted hover:text-white">
              Ver tudo
            </Link>
          </div>
          <MediaGrid items={recentVideos.map((m) => toMediaDTO(m, likedSet))} video />
        </section>
      )}

      {topPlayed.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Mais tocados</h2>
          <MediaGrid items={topPlayed.map((m) => toMediaDTO(m, likedSet))} />
        </section>
      )}
    </div>
  );
}
