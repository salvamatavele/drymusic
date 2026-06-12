import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { prisma } from "@/lib/db";
import { mediaPath } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

function nodeStream(path: string, opts?: { start: number; end: number }) {
  return Readable.toWeb(createReadStream(path, opts)) as ReadableStream;
}

export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return Response.json({ error: "Não encontrado" }, { status: 404 });

  const filePath = mediaPath(media.filename);
  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return Response.json({ error: "Ficheiro em falta" }, { status: 404 });
  }

  const range = request.headers.get("range");
  if (!range) {
    return new Response(nodeStream(filePath), {
      headers: {
        "content-type": media.mime,
        "content-length": String(size),
        "accept-ranges": "bytes",
        "cache-control": "no-store",
      },
    });
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  if (!match || (!match[1] && !match[2])) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }

  let start: number;
  let end: number;
  if (match[1]) {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  } else {
    // sufixo: bytes=-N (últimos N bytes)
    start = Math.max(size - Number(match[2]), 0);
    end = size - 1;
  }

  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }

  return new Response(nodeStream(filePath, { start, end }), {
    status: 206,
    headers: {
      "content-type": media.mime,
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes",
      "cache-control": "no-store",
    },
  });
}
