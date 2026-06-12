import { prisma } from "@/lib/db";
import { toPlaylistDTO } from "@/lib/serialize";
import { getVisitorId } from "@/lib/visitor";

export async function GET() {
  const visitorId = await getVisitorId();
  const playlists = await prisma.playlist.findMany({
    where: { visitorId: visitorId || "-" },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(playlists.map(toPlaylistDTO));
}

export async function POST(request: Request) {
  const visitorId = await getVisitorId();
  if (!visitorId) {
    return Response.json({ error: "Sem identidade de visitante" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const playlist = await prisma.playlist.create({
    data: {
      name,
      visitorId,
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim()
          : null,
    },
    include: { _count: { select: { items: true } } },
  });
  return Response.json(toPlaylistDTO(playlist), { status: 201 });
}
