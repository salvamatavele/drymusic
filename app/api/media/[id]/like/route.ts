import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const visitorId = await getVisitorId();
  if (!visitorId) {
    return Response.json({ error: "Sem identidade de visitante" }, { status: 400 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const liked = body.liked === true;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return Response.json({ error: "Não encontrado" }, { status: 404 });

  if (liked) {
    await prisma.like.upsert({
      where: { visitorId_mediaId: { visitorId, mediaId: id } },
      update: {},
      create: { visitorId, mediaId: id },
    });
  } else {
    await prisma.like.deleteMany({ where: { visitorId, mediaId: id } });
  }

  return Response.json({ ok: true, liked });
}
