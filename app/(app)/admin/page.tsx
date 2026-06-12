import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/serialize";
import AdminTable from "@/components/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const media = await prisma.media.findMany({
    include: { artist: true, album: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">Gerir biblioteca</h1>
      <AdminTable items={media.map((m) => toMediaDTO(m))} />
    </div>
  );
}
