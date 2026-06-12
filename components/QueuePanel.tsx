"use client";

import { Trash2, X } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/Cover";
import { formatTime } from "@/lib/format";

export default function QueuePanel() {
  const p = usePlayer();
  if (!p.queueOpen) return null;

  return (
    <aside className="fixed bottom-24 right-2 z-30 flex max-h-[60vh] w-80 max-w-[95vw] flex-col rounded-xl border border-border bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-sm font-bold">Fila de reprodução</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={p.clearQueue}
            title="Limpar fila"
            className="text-muted hover:text-white transition"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            onClick={p.toggleQueue}
            title="Fechar"
            className="text-muted hover:text-white transition"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {p.queue.map((item, i) => (
          <li
            key={`${item.id}-${i}`}
            onClick={() => p.jumpTo(i)}
            className={`group flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-elevated ${i === p.index ? "text-accent" : ""}`}
          >
            <Cover
              id={item.id}
              hasCover={item.hasCover}
              type={item.type}
              alt={item.title}
              className="size-9 rounded shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.title}</p>
              <p className="truncate text-xs text-muted">
                {item.artistName ?? "Desconhecido"}
              </p>
            </div>
            <span className="text-xs text-muted tabular-nums">
              {formatTime(item.duration)}
            </span>
            {i !== p.index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  p.removeFromQueue(i);
                }}
                title="Remover da fila"
                className="hidden text-muted hover:text-white group-hover:block"
              >
                <X className="size-4" />
              </button>
            )}
          </li>
        ))}
        {p.queue.length === 0 && (
          <li className="p-4 text-center text-sm text-muted">Fila vazia</li>
        )}
      </ul>
    </aside>
  );
}
