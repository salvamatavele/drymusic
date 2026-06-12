"use client";

import { Play, Shuffle } from "lucide-react";
import type { MediaDTO } from "@/lib/serialize";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function PlayAllButton({ items }: { items: MediaDTO[] }) {
  const player = usePlayer();
  if (!items.length) return null;

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={() => player.play(items[0], items)}
        title="Reproduzir tudo"
        className="flex size-11 items-center justify-center rounded-full bg-accent text-black hover:bg-accent-hover hover:scale-105 transition"
      >
        <Play className="size-5 fill-current translate-x-[1px]" />
      </button>
      <button
        onClick={() => {
          if (!player.shuffle) player.toggleShuffle();
          const random = items[Math.floor(Math.random() * items.length)];
          player.play(random, items);
        }}
        title="Reprodução aleatória"
        className="flex size-9 items-center justify-center rounded-full border border-border text-muted hover:text-white hover:border-white transition"
      >
        <Shuffle className="size-4" />
      </button>
    </span>
  );
}
