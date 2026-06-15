import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import MediaGrid from "@/components/MediaGrid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vídeos" };

export default async function VideosPage() {
  const [videos, likedSet] = await Promise.all([
    prisma.media.findMany({
      where: { type: "VIDEO" },
      include: { artist: true, album: true },
      orderBy: { createdAt: "desc" },
    }),
    getVisitorId().then(getLikedSet),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold md:text-3xl">Vídeos</h1>
      <MediaGrid items={videos.map((m) => toMediaDTO(m, likedSet))} video />
    </div>
  );
}
