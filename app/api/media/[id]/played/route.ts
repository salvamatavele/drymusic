import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const visitorId = await getVisitorId();
  try {
    await prisma.media.update({
      where: { id },
      data: {
        playCount: { increment: 1 },
        lastPlayed: new Date(),
        history: { create: { visitorId: visitorId || null } },
      },
    });
  } catch {
    return Response.json({ error: "Não encontrado" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
