"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MediaDTO } from "@/lib/serialize";
import { usePlayer } from "@/components/player/PlayerProvider";

/** Deep-link /watch/[id]: inicia a reprodução e expande o player. */
export default function WatchClient({ item }: { item: MediaDTO }) {
  const player = usePlayer();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    player.play(item);
    if (item.type === "VIDEO") player.expand();
    router.replace(item.type === "VIDEO" ? "/videos" : "/music");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
