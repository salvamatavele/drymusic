import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import { getLikedSet, getVisitorId } from "@/lib/visitor";
import WatchClient from "@/components/WatchClient";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
    include: { artist: true, album: true },
  });
  if (!media) notFound();

  const likedSet = await getVisitorId().then(getLikedSet);
  return <WatchClient item={toMediaDTO(media, likedSet)} />;
}
