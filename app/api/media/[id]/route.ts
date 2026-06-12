import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { coverPath, mediaPath, deleteQuietly } from "@/lib/storage";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const [media, likedSet] = await Promise.all([
    prisma.media.findUnique({
      where: { id },
      include: { artist: true, album: true },
    }),
    getVisitorId().then(getLikedSet),
  ]);
  if (!media) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json(toMediaDTO(media, likedSet));
}

/** Admin: editar metadados. */
export async function PATCH(request: Request, { params }: Ctx) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Não encontrado" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }

  if (typeof body.artist === "string") {
    const name = body.artist.trim();
    if (name) {
      const artist = await prisma.artist.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      data.artistId = artist.id;
    } else {
      data.artistId = null;
    }
  }

  if (typeof body.album === "string") {
    const title = body.album.trim();
    if (title) {
      const artistId =
        (data.artistId as string | null | undefined) ?? existing.artistId;
      const album =
        (await prisma.album.findFirst({ where: { title, artistId } })) ??
        (await prisma.album.create({ data: { title, artistId } }));
      data.albumId = album.id;
    } else {
      data.albumId = null;
    }
  }

  const media = await prisma.media.update({
    where: { id },
    data,
    include: { artist: true, album: true },
  });
  return Response.json(toMediaDTO(media));
}

/** Admin: apagar media + ficheiros. */
export async function DELETE(request: Request, { params }: Ctx) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return Response.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.media.delete({ where: { id } });
  await deleteQuietly(mediaPath(media.filename));
  if (media.cover) await deleteQuietly(coverPath(media.cover));

  return Response.json({ ok: true });
}
