"use client";

import { Play } from "lucide-react";
import type { MediaDTO } from "@/lib/serialize";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/Cover";

export default function MediaCard({
  item,
  queue,
}: {
  item: MediaDTO;
  /** fila a usar quando se carrega play (ex.: todos os itens da secção) */
  queue?: MediaDTO[];
}) {
  const player = usePlayer();
  const isVideo = item.type === "VIDEO";

  return (
    <button
      onClick={() => {
        player.play(item, queue);
        if (isVideo) player.expand();
      }}
      className="group flex flex-col gap-2 rounded-lg bg-surface p-3 text-left transition hover:bg-elevated"
    >
      <div className="relative">
        <Cover
          id={item.id}
          hasCover={item.hasCover}
          type={item.type}
          alt={item.title}
          className={`w-full rounded-md ${isVideo ? "aspect-video" : "aspect-square"}`}
        />
        <span className="absolute bottom-2 right-2 flex size-11 translate-y-1 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="size-5 fill-current translate-x-[1px]" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{item.title}</p>
        <p className="truncate text-xs text-muted">
          {item.artistName ?? (isVideo ? "Vídeo" : "Desconhecido")}
        </p>
      </div>
    </button>
  );
}
