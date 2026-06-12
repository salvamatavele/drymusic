"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";
import {
  listDownloads,
  storageEstimate,
  type DownloadEntry,
} from "@/lib/offline";
import TrackList from "@/components/TrackList";
import { formatBytes } from "@/lib/format";

export default function DownloadsPage() {
  const [items, setItems] = useState<DownloadEntry[]>([]);
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(
    null,
  );

  useEffect(() => {
    const sync = () => {
      setItems(listDownloads());
      storageEstimate().then(setUsage);
    };
    sync();
    window.addEventListener("drymusic:downloads-changed", sync);
    return () => window.removeEventListener("drymusic:downloads-changed", sync);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold md:text-3xl">Downloads</h1>
      <p className="text-sm text-muted">
        Disponíveis offline — funcionam sem internet.
        {usage && (
          <span className="ml-2 inline-flex items-center gap-1">
            <HardDrive className="size-4" />
            {formatBytes(usage.usage)} usados de {formatBytes(usage.quota)}
          </span>
        )}
      </p>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Ainda não descarregaste nada. Usa o botão de download numa música ou
          vídeo.
        </p>
      ) : (
        <TrackList items={items} />
      )}
    </div>
  );
}
