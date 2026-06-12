"use client";

import { Play, Pause, X } from "lucide-react";
import type { MediaDTO } from "@/lib/serialize";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/Cover";
import LikeButton from "@/components/LikeButton";
import DownloadButton from "@/components/DownloadButton";
import AddToPlaylistMenu from "@/components/AddToPlaylistMenu";
import { formatTime } from "@/lib/format";

export default function TrackList({
  items,
  onRemove,
}: {
  items: MediaDTO[];
  /** se definido, mostra botão de remover (ex.: numa playlist) */
  onRemove?: (item: MediaDTO) => void;
}) {
  const player = usePlayer();

  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted">Nada por aqui ainda.</p>;
  }

  return (
    <ul className="flex flex-col">
      {items.map((item, i) => {
        const isCurrent = player.current?.id === item.id;
        return (
          <li
            key={item.id}
            onClick={() => {
              if (isCurrent) player.toggle();
              else {
                player.play(item, items);
                if (item.type === "VIDEO") player.expand();
              }
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated"
          >
            <span className="w-6 text-center text-sm text-muted tabular-nums">
              <span className="group-hover:hidden">
                {isCurrent ? (
                  <span className="text-accent">♪</span>
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden group-hover:inline">
                {isCurrent && player.isPlaying ? (
                  <Pause className="inline size-4 fill-current" />
                ) : (
                  <Play className="inline size-4 fill-current" />
                )}
              </span>
            </span>
            <Cover
              id={item.id}
              hasCover={item.hasCover}
              type={item.type}
              alt={item.title}
              className={`shrink-0 rounded ${item.type === "VIDEO" ? "h-10 w-[71px]" : "size-10"}`}
            />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${isCurrent ? "text-accent" : ""}`}>
                {item.title}
              </p>
              <p className="truncate text-xs text-muted">
                {item.artistName ?? "Desconhecido"}
                {item.albumTitle ? ` • ${item.albumTitle}` : ""}
              </p>
            </div>
            <span
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <LikeButton id={item.id} liked={item.liked} />
              <DownloadButton item={item} />
              <AddToPlaylistMenu item={item} />
              {onRemove && (
                <button
                  onClick={() => onRemove(item)}
                  title="Remover"
                  className="text-muted hover:text-white transition"
                >
                  <X className="size-5" />
                </button>
              )}
            </span>
            <span className="w-12 text-right text-sm text-muted tabular-nums">
              {formatTime(item.duration)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
