"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListMusic, Pencil, Trash2 } from "lucide-react";
import type { MediaDTO, PlaylistDTO } from "@/lib/serialize";
import TrackList from "@/components/TrackList";
import PlayAllButton from "@/components/PlayAllButton";
import CollectionCover from "@/components/CollectionCover";

export default function PlaylistDetailClient({
  playlist,
  items: initialItems,
  isOwner,
}: {
  playlist: PlaylistDTO;
  items: MediaDTO[];
  isOwner: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState(playlist.name);
  const router = useRouter();

  async function rename() {
    const newName = prompt("Novo nome:", name);
    if (!newName?.trim() || newName === name) return;
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setName(newName.trim());
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm(`Apagar a playlist "${name}"?`)) return;
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.replace("/playlists");
      router.refresh();
    }
  }

  async function removeItem(item: MediaDTO) {
    const res = await fetch(`/api/playlists/${playlist.id}/items`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mediaId: item.id }),
    });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== item.id));
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5 rounded-xl bg-gradient-to-b from-sky-900/60 to-transparent p-6">
        <CollectionCover
          mediaId={items.find((i) => i.hasCover)?.id ?? null}
          icon={ListMusic}
          alt={name}
          className="size-28 rounded-lg shadow-2xl md:size-36"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider">Playlist</p>
          <h1 className="truncate text-3xl font-extrabold md:text-5xl">{name}</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} itens
            {playlist.description ? ` • ${playlist.description}` : ""}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-4">
        <PlayAllButton items={items} />
        {isOwner && (
          <>
            <button
              onClick={rename}
              title="Renomear"
              className="text-muted hover:text-white transition"
            >
              <Pencil className="size-5" />
            </button>
            <button
              onClick={remove}
              title="Apagar playlist"
              className="text-muted hover:text-red-400 transition"
            >
              <Trash2 className="size-5" />
            </button>
          </>
        )}
      </div>

      <TrackList items={items} onRemove={isOwner ? removeItem : undefined} />
    </div>
  );
}
