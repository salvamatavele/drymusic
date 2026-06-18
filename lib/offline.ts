"use client";

import type { MediaDTO } from "@/lib/serialize";
import { streamUrl, coverUrl } from "@/lib/serialize";
import { track } from "@/lib/track";

const MEDIA_CACHE = "media-v1";
const LS_KEY = "drymusic:downloads";

export type DownloadEntry = MediaDTO & { downloadedAt: string };

export function listDownloads(): DownloadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveDownloads(entries: DownloadEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("drymusic:downloads-changed"));
}

export function isDownloaded(id: string): boolean {
  return listDownloads().some((d) => d.id === id);
}

export async function addDownload(item: MediaDTO): Promise<void> {
  if (!("caches" in window)) throw new Error("Cache API indisponível");
  const cache = await caches.open(MEDIA_CACHE);

  const res = await fetch(streamUrl(item.id));
  if (!res.ok) throw new Error(`Falha no download (${res.status})`);
  await cache.put(streamUrl(item.id), res);

  if (item.hasCover) {
    try {
      const cover = await fetch(coverUrl(item.id));
      if (cover.ok) await cache.put(coverUrl(item.id), cover);
    } catch {
      // capa é opcional offline
    }
  }

  const entries = listDownloads().filter((d) => d.id !== item.id);
  entries.unshift({ ...item, downloadedAt: new Date().toISOString() });
  saveDownloads(entries);
  track("download", item.id);
}

export async function removeDownload(id: string): Promise<void> {
  if ("caches" in window) {
    const cache = await caches.open(MEDIA_CACHE);
    await cache.delete(streamUrl(id));
    await cache.delete(coverUrl(id));
  }
  saveDownloads(listDownloads().filter((d) => d.id !== id));
}

export async function storageEstimate(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota };
}
