import Link from "next/link";
import { Disc3 } from "lucide-react";
import { prisma } from "@/lib/db";
import CollectionCover from "@/components/CollectionCover";

export const dynamic = "force-dynamic";
export const metadata = { title: "Álbuns" };

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    include: {
      artist: true,
      _count: { select: { media: true } },
      media: {
        where: { cover: { not: null } },
        select: { id: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold md:text-3xl">Álbuns</h1>
      {!albums.length && (
        <p className="py-8 text-center text-sm text-muted">Nada por aqui ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {albums.map((al) => (
          <Link
            key={al.id}
            href={`/albums/${al.id}`}
            className="group flex flex-col gap-3 rounded-lg bg-surface p-3 transition hover:bg-elevated"
          >
            <CollectionCover
              mediaId={al.media[0]?.id ?? null}
              icon={Disc3}
              alt={al.title}
              className="aspect-square w-full rounded-md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{al.title}</p>
              <p className="truncate text-xs text-muted">
                {al.artist?.name ?? "Vários"} • {al._count.media} faixas
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
