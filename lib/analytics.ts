import { prisma } from "@/lib/db";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

export async function getAnalytics() {
  const now = Date.now();
  const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalVisits,
    visitorRows,
    totalDownloads,
    totalInstalls,
    totalApk,
    apk7,
    playsAgg,
    visits7,
    downloads7,
    plays7,
    recentEvents,
    topPlayed,
    topDownloadGroups,
  ] = await Promise.all([
    prisma.event.count({ where: { type: "visit" } }),
    prisma.event.findMany({
      where: { type: "visit", visitorId: { not: null } },
      distinct: ["visitorId"],
      select: { visitorId: true },
    }),
    prisma.event.count({ where: { type: "download" } }),
    prisma.event.count({ where: { type: "install" } }),
    prisma.event.count({ where: { type: "apk" } }),
    prisma.event.count({ where: { type: "apk", createdAt: { gte: since7 } } }),
    prisma.media.aggregate({ _sum: { playCount: true } }),
    prisma.event.count({ where: { type: "visit", createdAt: { gte: since7 } } }),
    prisma.event.count({
      where: { type: "download", createdAt: { gte: since7 } },
    }),
    prisma.playHistory.count({ where: { playedAt: { gte: since7 } } }),
    prisma.event.findMany({
      where: { type: { in: ["visit", "download"] }, createdAt: { gte: since7 } },
      select: { type: true, createdAt: true },
    }),
    prisma.media.findMany({
      where: { playCount: { gt: 0 } },
      orderBy: { playCount: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        artist: { select: { name: true } },
        playCount: true,
      },
    }),
    prisma.event.groupBy({
      by: ["mediaId"],
      where: { type: "download", mediaId: { not: null } },
      _count: { mediaId: true },
      orderBy: { _count: { mediaId: "desc" } },
      take: 5,
    }),
  ]);

  const dlMediaIds = topDownloadGroups
    .map((g) => g.mediaId)
    .filter((id): id is string => !!id);
  const dlMedia = dlMediaIds.length
    ? await prisma.media.findMany({
        where: { id: { in: dlMediaIds } },
        select: { id: true, title: true, artist: { select: { name: true } } },
      })
    : [];
  const topDownloaded = topDownloadGroups.map((g) => ({
    count: g._count.mediaId,
    media: dlMedia.find((m) => m.id === g.mediaId) ?? null,
  }));

  const days: { day: string; visits: number; downloads: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push({ day: dayKey(new Date(now - i * 86400000)), visits: 0, downloads: 0 });
  }
  for (const e of recentEvents) {
    const row = days.find((d) => d.day === dayKey(e.createdAt));
    if (!row) continue;
    if (e.type === "visit") row.visits++;
    else if (e.type === "download") row.downloads++;
  }

  return {
    totalVisits,
    uniqueVisitors: visitorRows.length,
    totalDownloads,
    totalInstalls,
    totalApk,
    apk7,
    totalPlays: playsAgg._sum.playCount ?? 0,
    visits7,
    downloads7,
    plays7,
    days,
    topPlayed,
    topDownloaded,
  };
}
