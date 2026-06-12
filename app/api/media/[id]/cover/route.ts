import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { coverPath, extFromMime, deleteQuietly } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media?.cover) {
    return Response.json({ error: "Sem capa" }, { status: 404 });
  }

  const filePath = coverPath(media.cover);
  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return Response.json({ error: "Ficheiro em falta" }, { status: 404 });
  }

  const ext = media.cover.split(".").pop() ?? "jpg";
  const mime =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, {
    headers: {
      "content-type": mime,
      "content-length": String(size),
      "cache-control": "private, max-age=86400",
    },
  });
}

export async function POST(request: Request, { params }: Ctx) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return Response.json({ error: "Não encontrado" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("cover");
  if (!(file instanceof File)) {
    return Response.json({ error: "cover é obrigatório" }, { status: 400 });
  }
  const ext = extFromMime(file.type);
  if (!ext || !file.type.startsWith("image/")) {
    return Response.json({ error: `Tipo não suportado: ${file.type}` }, { status: 415 });
  }

  const filename = `${id}.${ext}`;
  await writeFile(coverPath(filename), Buffer.from(await file.arrayBuffer()));

  if (media.cover && media.cover !== filename) {
    await deleteQuietly(coverPath(media.cover));
  }
  await prisma.media.update({ where: { id }, data: { cover: filename } });

  return Response.json({ ok: true });
}
