import { prisma } from "@/lib/db";

/** Nomes de artistas e títulos de álbuns existentes, para autocomplete. */
export async function GET() {
  const [artists, albums] = await Promise.all([
    prisma.artist.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.album.findMany({
      select: { title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return Response.json({
    artists: artists.map((a) => a.name),
    albums: [...new Set(albums.map((a) => a.title))],
  });
}
