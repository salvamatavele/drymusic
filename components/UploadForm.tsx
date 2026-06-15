"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UploadCloud, XCircle } from "lucide-react";
import SuggestionDatalists from "@/components/SuggestionDatalists";

type FileJob = {
  file: File;
  title: string;
  artist: string;
  album: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function titleFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function extractDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement(
      file.type.startsWith("video/") ? "video" : "audio",
    );
    const url = URL.createObjectURL(file);
    const cleanup = (d: number | null) => {
      URL.revokeObjectURL(url);
      resolve(d);
    };
    el.preload = "metadata";
    el.onloadedmetadata = () =>
      cleanup(isFinite(el.duration) ? el.duration : null);
    el.onerror = () => cleanup(null);
    el.src = url;
  });
}

function uploadWithProgress(
  job: FileJob,
  cover: File | null,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    extractDuration(job.file).then((duration) => {
      const params = new URLSearchParams({ title: job.title });
      if (job.artist) params.set("artist", job.artist);
      if (job.album) params.set("album", job.album);
      if (duration != null) params.set("duration", String(duration));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/upload?${params}`);
      xhr.setRequestHeader(
        "content-type",
        job.file.type || "application/octet-stream",
      );
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
      };
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (cover) {
            try {
              const { id } = JSON.parse(xhr.responseText);
              const fd = new FormData();
              fd.append("cover", cover);
              await fetch(`/api/media/${id}/cover`, {
                method: "POST",
                body: fd,
              });
            } catch {
              // capa falhou, upload principal ok
            }
          }
          resolve();
        } else {
          let msg = `Erro ${xhr.status}`;
          try {
            msg = JSON.parse(xhr.responseText).error ?? msg;
          } catch {}
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error("Erro de rede"));
      xhr.send(job.file);
    });
  });
}

export default function UploadForm() {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function pickFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map<FileJob>((file) => ({
      file,
      title: titleFromFilename(file.name),
      artist: "",
      album: "",
      status: "pending",
      progress: 0,
    }));
    setJobs((j) => [...j, ...next]);
  }

  function updateJob(i: number, patch: Partial<FileJob>) {
    setJobs((js) => js.map((j, idx) => (idx === i ? { ...j, ...patch } : j)));
  }

  async function uploadAll() {
    setBusy(true);
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.status === "done") continue;
      updateJob(i, { status: "uploading", progress: 0 });
      try {
        await uploadWithProgress(job, cover, (pct) =>
          updateJob(i, { progress: pct }),
        );
        updateJob(i, { status: "done", progress: 100 });
      } catch (err) {
        updateJob(i, {
          status: "error",
          error: err instanceof Error ? err.message : "Falhou",
        });
      }
    }
    setBusy(false);
    router.refresh();
  }

  const pending = jobs.filter((j) => j.status !== "done");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SuggestionDatalists />
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-10 text-center transition hover:border-accent">
        <UploadCloud className="size-10 text-muted" />
        <span className="font-semibold">
          Escolher músicas ou vídeos
        </span>
        <span className="text-sm text-muted">
          MP3, M4A, FLAC, OGG, WAV, MP4, WebM, MKV…
        </span>
        <input
          type="file"
          accept="audio/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            pickFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {jobs.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">
              Capa (opcional, aplicada a todos):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          <ul className="flex flex-col gap-3">
            {jobs.map((job, i) => (
              <li key={i} className="rounded-lg bg-surface p-4">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-sm text-muted">
                    {job.file.name}{" "}
                    <span className="text-xs">
                      ({(job.file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </p>
                  {job.status === "uploading" && (
                    <Loader2 className="size-5 animate-spin text-accent" />
                  )}
                  {job.status === "done" && (
                    <CheckCircle2 className="size-5 text-accent" />
                  )}
                  {job.status === "error" && (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <XCircle className="size-4" /> {job.error}
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    value={job.title}
                    onChange={(e) => updateJob(i, { title: e.target.value })}
                    placeholder="Título"
                    disabled={job.status === "uploading" || job.status === "done"}
                    className="rounded bg-elevated px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    value={job.artist}
                    onChange={(e) => updateJob(i, { artist: e.target.value })}
                    placeholder="Artista"
                    list="artist-suggestions"
                    disabled={job.status === "uploading" || job.status === "done"}
                    className="rounded bg-elevated px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    value={job.album}
                    onChange={(e) => updateJob(i, { album: e.target.value })}
                    placeholder="Álbum (só música)"
                    list="album-suggestions"
                    disabled={job.status === "uploading" || job.status === "done"}
                    className="rounded bg-elevated px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {job.status === "uploading" && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={uploadAll}
            disabled={busy || pending.length === 0}
            className="self-start rounded-full bg-accent px-8 py-3 font-bold text-black hover:bg-accent-hover disabled:opacity-50 transition"
          >
            {busy
              ? "A enviar…"
              : `Enviar ${pending.length} ficheiro${pending.length === 1 ? "" : "s"}`}
          </button>
        </>
      )}
    </div>
  );
}
