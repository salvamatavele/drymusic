"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import type { MediaDTO } from "@/lib/serialize";
import Cover from "@/components/Cover";
import { formatBytes, formatTime } from "@/lib/format";

export default function AdminTable({ items }: { items: MediaDTO[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", album: "" });
  const router = useRouter();

  function startEdit(item: MediaDTO) {
    setEditing(item.id);
    setForm({
      title: item.title,
      artist: item.artistName ?? "",
      album: item.albumTitle ?? "",
    });
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(item: MediaDTO) {
    if (!confirm(`Apagar "${item.title}" definitivamente?`)) return;
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  async function changeCover(id: string, file: File) {
    const fd = new FormData();
    fd.append("cover", file);
    const res = await fetch(`/api/media/${id}/cover`, {
      method: "POST",
      body: fd,
    });
    if (res.ok) router.refresh();
  }

  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted">Biblioteca vazia.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-xs uppercase text-muted">
          <tr>
            <th className="p-3"></th>
            <th className="p-3">Título</th>
            <th className="p-3">Artista</th>
            <th className="p-3">Álbum</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Duração</th>
            <th className="p-3">Tamanho</th>
            <th className="p-3">Plays</th>
            <th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-border hover:bg-surface">
              <td className="p-2">
                <label className="group relative block cursor-pointer" title="Mudar capa">
                  <Cover
                    id={item.id}
                    hasCover={item.hasCover}
                    type={item.type}
                    alt={item.title}
                    className="size-10 rounded"
                  />
                  <span className="absolute inset-0 hidden items-center justify-center rounded bg-black/60 group-hover:flex">
                    <ImagePlus className="size-4" />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) changeCover(item.id, f);
                    }}
                  />
                </label>
              </td>
              {editing === item.id ? (
                <>
                  <td className="p-2">
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded bg-elevated px-2 py-1 outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                      className="w-full rounded bg-elevated px-2 py-1 outline-none"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={form.album}
                      onChange={(e) => setForm({ ...form, album: e.target.value })}
                      className="w-full rounded bg-elevated px-2 py-1 outline-none"
                    />
                  </td>
                </>
              ) : (
                <>
                  <td className="max-w-48 truncate p-3 font-medium">{item.title}</td>
                  <td className="max-w-32 truncate p-3 text-muted">
                    {item.artistName ?? "—"}
                  </td>
                  <td className="max-w-32 truncate p-3 text-muted">
                    {item.albumTitle ?? "—"}
                  </td>
                </>
              )}
              <td className="p-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.type === "VIDEO"
                      ? "bg-sky-900/60 text-sky-300"
                      : "bg-emerald-900/60 text-emerald-300"
                  }`}
                >
                  {item.type === "VIDEO" ? "Vídeo" : "Música"}
                </span>
              </td>
              <td className="p-3 text-muted tabular-nums">
                {formatTime(item.duration)}
              </td>
              <td className="p-3 text-muted">{formatBytes(item.size)}</td>
              <td className="p-3 text-muted tabular-nums">{item.playCount}</td>
              <td className="p-3">
                <div className="flex justify-end gap-2">
                  {editing === item.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(item.id)}
                        title="Guardar"
                        className="text-accent hover:text-accent-hover"
                      >
                        <Check className="size-5" />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        title="Cancelar"
                        className="text-muted hover:text-white"
                      >
                        <X className="size-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        title="Editar"
                        className="text-muted hover:text-white"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        title="Apagar"
                        className="text-muted hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
