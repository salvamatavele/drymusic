"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, CheckCircle2, Loader2 } from "lucide-react";
import type { MediaDTO } from "@/lib/serialize";
import { addDownload, isDownloaded, removeDownload } from "@/lib/offline";

export default function DownloadButton({
  item,
  className = "",
}: {
  item: MediaDTO;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => {
    const sync = () => setState(isDownloaded(item.id) ? "done" : "idle");
    sync();
    window.addEventListener("drymusic:downloads-changed", sync);
    return () => window.removeEventListener("drymusic:downloads-changed", sync);
  }, [item.id]);

  async function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (state === "busy") return;
    if (state === "done") {
      if (confirm(`Remover "${item.title}" dos downloads?`)) {
        await removeDownload(item.id);
      }
      return;
    }
    setState("busy");
    try {
      await addDownload(item);
      setState("done");
    } catch (err) {
      console.error(err);
      alert("Falha no download para offline");
      setState("idle");
    }
  }

  return (
    <button
      onClick={onClick}
      title={
        state === "done"
          ? "Disponível offline (clicar para remover)"
          : "Descarregar para offline"
      }
      className={`text-muted hover:text-white transition ${state === "done" ? "!text-accent" : ""} ${className}`}
    >
      {state === "busy" ? (
        <Loader2 className="size-5 animate-spin" />
      ) : state === "done" ? (
        <CheckCircle2 className="size-5" />
      ) : (
        <ArrowDownToLine className="size-5" />
      )}
    </button>
  );
}
