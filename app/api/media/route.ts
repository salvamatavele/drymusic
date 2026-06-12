import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q")?.trim();
  const liked = url.searchParams.get("liked");

  const visitorId = await getVisitorId();

  const where: Prisma.MediaWhereInput = {};
  if (type === "MUSIC" || type === "VIDEO") where.type = type;
  if (liked === "true") where.likes = { some: { visitorId } };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { artist: { name: { contains: q } } },
      { album: { title: { contains: q } } },
    ];
  }

  const [items, likedSet] = await Promise.all([
    prisma.media.findMany({
      where,
      include: { artist: true, album: true },
      orderBy: { createdAt: "desc" },
    }),
    getLikedSet(visitorId),
  ]);

  return Response.json(items.map((m) => toMediaDTO(m, likedSet)));
}
