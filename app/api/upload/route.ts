import { createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { extFromMime, mediaPath, deleteQuietly } from "@/lib/storage";
import { convertToMp4, needsConversion, probe } from "@/lib/ffmpeg";
import { toMediaDTO } from "@/lib/serialize";

export async function POST(request: Request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const title = url.searchParams.get("title")?.trim();
  const artist = url.searchParams.get("artist")?.trim() || null;
  const album = url.searchParams.get("album")?.trim() || null;
  const durationRaw = url.searchParams.get("duration");
  const duration = durationRaw ? Number(durationRaw) || null : null;
  const mime = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!title) {
    return Response.json({ error: "title é obrigatório" }, { status: 400 });
  }
  const ext = extFromMime(mime);
  if (!ext || (!mime.startsWith("audio/") && !mime.startsWith("video/"))) {
    return Response.json({ error: `Tipo não suportado: ${mime}` }, { status: 415 });
  }
  if (!request.body) {
    return Response.json({ error: "Corpo vazio" }, { status: 400 });
  }

  const type = mime.startsWith("video/") ? "VIDEO" : "MUSIC";
  const id = crypto.randomUUID();
  let filename = `${id}.${ext}`;
  let filePath = mediaPath(filename);
  let finalMime = mime;
  let finalDuration = duration;

  try {
    await pipeline(
      Readable.fromWeb(request.body as import("node:stream/web").ReadableStream),
      createWriteStream(filePath),
    );
    let { size } = await stat(filePath);

    // vídeos em containers que o browser não reproduz (mkv, mov, avi…)
    // são convertidos para MP4 (H.264/AAC); remux rápido quando possível
    if (type === "VIDEO" && needsConversion(mime)) {
      const converted = await convertToMp4(filePath, id, path.dirname(filePath));
      filename = converted.filename;
      filePath = converted.filePath;
      finalMime = converted.mime;
      size = converted.size;
      finalDuration = converted.duration ?? finalDuration;
    }

    // duração em falta (ex.: o browser não leu os metadados) → ffprobe
    if (finalDuration == null) {
      finalDuration = (await probe(filePath))?.duration ?? null;
    }

    const media = await prisma.media.create({
      data: {
        id,
        type,
        title,
        duration: finalDuration,
        filename,
        mime: finalMime,
        size: BigInt(size),
        ...(artist && {
          artist: {
            connectOrCreate: {
              where: { name: artist },
              create: { name: artist },
            },
          },
        }),
      },
      include: { artist: true, album: true },
    });

    // Album precisa do artistId resolvido (unique title+artistId; null não participa no unique)
    if (album) {
      const albumRow =
        (await prisma.album.findFirst({
          where: { title: album, artistId: media.artistId },
        })) ??
        (await prisma.album.create({
          data: { title: album, artistId: media.artistId },
        }));
      const updated = await prisma.media.update({
        where: { id },
        data: { albumId: albumRow.id },
        include: { artist: true, album: true },
      });
      return Response.json(toMediaDTO(updated), { status: 201 });
    }

    return Response.json(toMediaDTO(media), { status: 201 });
  } catch (err) {
    await deleteQuietly(filePath);
    console.error("upload failed:", err);
    return Response.json({ error: "Falha no upload" }, { status: 500 });
  }
}
