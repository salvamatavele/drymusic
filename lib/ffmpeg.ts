import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";
import { deleteQuietly } from "@/lib/storage";

const exec = promisify(execFile);

export type ProbeResult = {
  duration: number | null;
  vcodec: string | null;
  acodec: string | null;
};

export async function probe(filePath: string): Promise<ProbeResult | null> {
  try {
    const { stdout } = await exec("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-show_entries",
      "stream=codec_type,codec_name",
      "-of",
      "json",
      filePath,
    ]);
    const data = JSON.parse(stdout) as {
      format?: { duration?: string };
      streams?: { codec_type?: string; codec_name?: string }[];
    };
    const duration = data.format?.duration ? Number(data.format.duration) : null;
    const vcodec =
      data.streams?.find((s) => s.codec_type === "video")?.codec_name ?? null;
    const acodec =
      data.streams?.find((s) => s.codec_type === "audio")?.codec_name ?? null;
    return { duration, vcodec, acodec };
  } catch {
    return null;
  }
}

/** Containers que os browsers reproduzem nativamente no <video>. */
const BROWSER_OK_MIMES = new Set(["video/mp4", "video/webm"]);

export function needsConversion(mime: string): boolean {
  return mime.startsWith("video/") && !BROWSER_OK_MIMES.has(mime);
}

export type ConvertResult = {
  filePath: string;
  filename: string;
  mime: string;
  size: number;
  duration: number | null;
};

/**
 * Converte um vídeo para MP4 reproduzível em qualquer browser.
 * Faz remux (cópia de streams) quando os codecs já são compatíveis;
 * caso contrário transcodifica para H.264/AAC.
 */
export async function convertToMp4(
  inputPath: string,
  id: string,
  targetDir: string,
): Promise<ConvertResult> {
  const info = await probe(inputPath);
  const outPath = `${targetDir}/${id}.mp4`;

  const videoArgs =
    info?.vcodec === "h264"
      ? ["-c:v", "copy"]
      : ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p"];
  const audioArgs =
    info?.acodec === "aac" || info?.acodec === "mp3"
      ? ["-c:a", "copy"]
      : ["-c:a", "aac", "-b:a", "192k"];

  try {
    await exec(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        inputPath,
        ...videoArgs,
        ...audioArgs,
        "-movflags",
        "+faststart",
        outPath,
      ],
      { maxBuffer: 1024 * 1024 * 16 },
    );
  } catch (err) {
    await deleteQuietly(outPath);
    throw err;
  }

  const { size } = await stat(outPath);
  const finalInfo = await probe(outPath);
  await deleteQuietly(inputPath);

  return {
    filePath: outPath,
    filename: `${id}.mp4`,
    mime: "video/mp4",
    size,
    duration: finalInfo?.duration ?? info?.duration ?? null,
  };
}
