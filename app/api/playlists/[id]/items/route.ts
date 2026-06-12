import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

type Ctx = { params: Promise<{ id: string }> };

/** Só o dono da playlist pode alterar os itens. */
async function checkOwner(id: string): Promise<Response | null> {
  const visitorId = await getVisitorId();
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) {
    return Response.json({ error: "Não encontrada" }, { status: 404 });
  }
  if (!visitorId || playlist.visitorId !== visitorId) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }
  return null;
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const denied = await checkOwner(id);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const mediaId = typeof body.mediaId === "string" ? body.mediaId : "";
  if (!mediaId) {
    return Response.json({ error: "mediaId é obrigatório" }, { status: 400 });
  }

  const exists = await prisma.playlistItem.findUnique({
    where: { playlistId_mediaId: { playlistId: id, mediaId } },
  });
  if (exists) return Response.json({ ok: true, duplicate: true });

  const last = await prisma.playlistItem.findFirst({
    where: { playlistId: id },
    orderBy: { position: "desc" },
  });

  try {
    await prisma.playlistItem.create({
      data: { playlistId: id, mediaId, position: (last?.position ?? -1) + 1 },
    });
  } catch {
    return Response.json({ error: "Playlist ou media inválida" }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  const denied = await checkOwner(id);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const mediaId = typeof body.mediaId === "string" ? body.mediaId : "";
  if (!mediaId) {
    return Response.json({ error: "mediaId é obrigatório" }, { status: 400 });
  }

  await prisma.playlistItem.deleteMany({
    where: { playlistId: id, mediaId },
  });
  return Response.json({ ok: true });
}

/** Reordenar: body = { order: mediaId[] } */
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const denied = await checkOwner(id);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const order: unknown = body.order;
  if (!Array.isArray(order) || order.some((m) => typeof m !== "string")) {
    return Response.json({ error: "order inválido" }, { status: 400 });
  }

  await prisma.$transaction(
    (order as string[]).map((mediaId, position) =>
      prisma.playlistItem.updateMany({
        where: { playlistId: id, mediaId },
        data: { position },
      }),
    ),
  );
  return Response.json({ ok: true });
}
