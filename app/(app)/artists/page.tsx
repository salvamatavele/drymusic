import Link from "next/link";
import { MicVocal } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Artistas" };

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    include: { _count: { select: { media: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold md:text-3xl">Artistas</h1>
      {!artists.length && (
        <p className="py-8 text-center text-sm text-muted">Nada por aqui ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {artists.map((a) => (
          <Link
            key={a.id}
            href={`/artists/${a.id}`}
            className="group flex flex-col items-center gap-3 rounded-lg bg-surface p-4 transition hover:bg-elevated"
          >
            <span className="flex size-28 items-center justify-center rounded-full bg-elevated text-muted group-hover:text-white transition">
              <MicVocal className="size-10" />
            </span>
            <div className="text-center">
              <p className="truncate font-semibold">{a.name}</p>
              <p className="text-xs text-muted">{a._count.media} itens</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
