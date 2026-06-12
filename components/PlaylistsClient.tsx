"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListMusic, Plus } from "lucide-react";
import type { PlaylistDTO } from "@/lib/serialize";

export default function PlaylistsClient({
  initial,
}: {
  initial: PlaylistDTO[];
}) {
  const [playlists, setPlaylists] = useState(initial);
  const router = useRouter();

  async function create() {
    const name = prompt("Nome da playlist:");
    if (!name?.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const pl = await res.json();
      setPlaylists([pl, ...playlists]);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Playlists</h1>
        <button
          onClick={create}
          title="Nova playlist"
          className="flex size-9 items-center justify-center rounded-full bg-accent text-black hover:bg-accent-hover transition"
        >
          <Plus className="size-5" />
        </button>
      </div>

      {!playlists.length && (
        <p className="py-8 text-center text-sm text-muted">
          Ainda não tens playlists. Cria a primeira!
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            href={`/playlists/${pl.id}`}
            className="group flex flex-col gap-3 rounded-lg bg-surface p-3 transition hover:bg-elevated"
          >
            <span className="flex aspect-square w-full items-center justify-center rounded-md bg-elevated text-muted group-hover:text-white transition">
              <ListMusic className="size-12" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{pl.name}</p>
              <p className="text-xs text-muted">{pl.itemCount} itens</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
