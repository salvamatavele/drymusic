"use client";

import { useEffect, useRef, useState } from "react";
import { ListPlus, Plus, ListEnd, ListStart } from "lucide-react";
import type { MediaDTO, PlaylistDTO } from "@/lib/serialize";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function AddToPlaylistMenu({
  item,
  className = "",
}: {
  item: MediaDTO;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDTO[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const player = usePlayer();

  useEffect(() => {
    if (!open) return;
    fetch("/api/playlists")
      .then((r) => r.json())
      .then(setPlaylists)
      .catch(() => setPlaylists([]));
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function addTo(playlistId: string) {
    await fetch(`/api/playlists/${playlistId}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mediaId: item.id }),
    });
    setOpen(false);
  }

  async function createAndAdd() {
    const name = prompt("Nome da nova playlist:");
    if (!name?.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const pl = await res.json();
      await addTo(pl.id);
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Adicionar a…"
        className="text-muted hover:text-white transition"
      >
        <ListPlus className="size-5" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-border bg-elevated p-1 shadow-2xl"
        >
          <button
            onClick={() => {
              player.playNext(item);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-border"
          >
            <ListStart className="size-4" /> Reproduzir a seguir
          </button>
          <button
            onClick={() => {
              player.addToQueue(item);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-border"
          >
            <ListEnd className="size-4" /> Adicionar à fila
          </button>
          <div className="my-1 border-t border-border" />
          <p className="px-3 py-1 text-xs font-bold uppercase text-muted">
            Adicionar à playlist
          </p>
          {playlists === null && (
            <p className="px-3 py-2 text-sm text-muted">A carregar…</p>
          )}
          {playlists?.map((pl) => (
            <button
              key={pl.id}
              onClick={() => addTo(pl.id)}
              className="block w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-border"
            >
              {pl.name}
            </button>
          ))}
          <button
            onClick={createAndAdd}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-accent hover:bg-border"
          >
            <Plus className="size-4" /> Nova playlist
          </button>
        </div>
      )}
    </div>
  );
}
