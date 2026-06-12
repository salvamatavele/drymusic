import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const VISITOR_COOKIE = "drymusic_visitor";

/** Id anónimo do visitante (definido pelo proxy; vazio só no primeiro request). */
export async function getVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value ?? "";
}

export async function getLikedSet(visitorId: string): Promise<Set<string>> {
  if (!visitorId) return new Set();
  const likes = await prisma.like.findMany({
    where: { visitorId },
    select: { mediaId: true },
  });
  return new Set(likes.map((l) => l.mediaId));
}
