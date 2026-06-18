import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";

export const VISITOR_COOKIE = "drymusic_visitor";
export const VISITOR_HEADER = "x-visitor-id";

/**
 * Id anónimo do visitante. Na web vem do cookie (definido pelo proxy); clientes
 * nativos (app Ionic), que não têm cookies fiáveis cross-origin, enviam-no no
 * header `x-visitor-id`.
 */
export async function getVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(VISITOR_COOKIE)?.value;
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  return headerStore.get(VISITOR_HEADER)?.trim() ?? "";
}

export async function getLikedSet(visitorId: string): Promise<Set<string>> {
  if (!visitorId) return new Set();
  const likes = await prisma.like.findMany({
    where: { visitorId },
    select: { mediaId: true },
  });
  return new Set(likes.map((l) => l.mediaId));
}
