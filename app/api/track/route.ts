import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

const ALLOWED = new Set(["visit", "download", "install", "apk"]);

/** Regista um evento de analytics (público, fire-and-forget). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const type = typeof body.type === "string" ? body.type : "";
  if (!ALLOWED.has(type)) {
    return Response.json({ error: "type inválido" }, { status: 400 });
  }

  const visitorId = (await getVisitorId()) || null;
  const mediaId = typeof body.mediaId === "string" ? body.mediaId : null;

  await prisma.event.create({ data: { type, visitorId, mediaId } });
  return Response.json({ ok: true });
}
