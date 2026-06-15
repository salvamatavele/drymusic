import { prisma } from "@/lib/db";
import { toMediaDTO, toPlaylistDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const [playlist, likedSet] = await Promise.all([
    prisma.playlist.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true } },
        items: {
          orderBy: { position: "asc" },
          include: { media: { include: { artist: true, album: true } } },
        },
      },
    }),
    getVisitorId().then(getLikedSet),
  ]);
  if (!playlist) {
    return Response.json({ error: "Não encontrada" }, { status: 404 });
  }
  const coverMediaId =
    playlist.items.find((i) => i.media.cover != null)?.mediaId ?? null;
  return Response.json({
    ...toPlaylistDTO(playlist, coverMediaId),
    items: playlist.items.map((i) => toMediaDTO(i.media, likedSet)),
  });
}

/** Só o dono da playlist pode alterar/apagar. */
async function ownedPlaylist(id: string) {
  const visitorId = await getVisitorId();
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) return { error: 404 as const };
  if (!visitorId || playlist.visitorId !== visitorId) {
    return { error: 403 as const };
  }
  return { playlist };
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const owned = await ownedPlaylist(id);
  if ("error" in owned) {
    return Response.json(
      { error: owned.error === 404 ? "Não encontrada" : "Sem permissão" },
      { status: owned.error },
    );
  }

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim() || null;
  }

  const playlist = await prisma.playlist.update({
    where: { id },
    data,
    include: { _count: { select: { items: true } } },
  });
  return Response.json(toPlaylistDTO(playlist));
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  const owned = await ownedPlaylist(id);
  if ("error" in owned) {
    return Response.json(
      { error: owned.error === 404 ? "Não encontrada" : "Sem permissão" },
      { status: owned.error },
    );
  }

  await prisma.playlist.delete({ where: { id } });
  return Response.json({ ok: true });
}
