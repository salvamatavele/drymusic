import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";

export const MEDIA_DIR = path.join(process.cwd(), "media", "files");
export const COVERS_DIR = path.join(process.cwd(), "media", "covers");

let dirsReady = false;
export function ensureDirs() {
  if (dirsReady) return;
  mkdirSync(MEDIA_DIR, { recursive: true });
  mkdirSync(COVERS_DIR, { recursive: true });
  dirsReady = true;
}

export function mediaPath(filename: string) {
  ensureDirs();
  return path.join(MEDIA_DIR, path.basename(filename));
}

export function coverPath(filename: string) {
  ensureDirs();
  return path.join(COVERS_DIR, path.basename(filename));
}

const MIME_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/opus": "opus",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/flac": "flac",
  "audio/x-flac": "flac",
  "audio/webm": "weba",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/avi": "avi",
  "video/x-ms-wmv": "wmv",
  "video/x-flv": "flv",
  "video/mpeg": "mpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extFromMime(mime: string): string | null {
  return MIME_EXT[mime.toLowerCase()] ?? null;
}

export async function deleteQuietly(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // already gone
  }
}
