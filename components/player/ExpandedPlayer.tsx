"use client";

import { ChevronDown, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/Cover";
import LikeButton from "@/components/LikeButton";
import DownloadButton from "@/components/DownloadButton";
import { formatTime } from "@/lib/format";

export default function ExpandedPlayer() {
  const p = usePlayer();
  if (!p.expanded || !p.current) return null;

  const item = p.current;
  const isVideo = item.type === "VIDEO";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base pointer-events-none">
      {/* para vídeo, o elemento <video> do PlayerProvider flutua por cima (z-[55]) na zona central */}
      <div className="pointer-events-auto flex items-center justify-between p-4">
        <button
          onClick={p.collapse}
          title="Minimizar"
          className="flex size-10 items-center justify-center rounded-full bg-elevated text-white hover:bg-border transition"
        >
          <ChevronDown className="size-6" />
        </button>
        <div className="flex items-center gap-4">
          <LikeButton
            key={`${item.id}-${item.liked}`}
            id={item.id}
            liked={item.liked}
            onChange={(liked) => p.updateCurrent({ liked })}
          />
          <DownloadButton item={item} />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        {!isVideo && (
          <div className="pointer-events-auto flex flex-col items-center gap-6">
            <Cover
              id={item.id}
              hasCover={item.hasCover}
              type={item.type}
              alt={item.title}
              className="size-64 md:size-80 rounded-xl shadow-2xl"
            />
          </div>
        )}
        {/* para vídeo, o espaço central é ocupado pelo elemento <video> por baixo */}
      </div>

      <div className="pointer-events-auto mx-auto w-full max-w-2xl p-6 pb-10">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold">{item.title}</h2>
          <p className="text-sm text-muted">{item.artistName ?? "Desconhecido"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-10 text-right tabular-nums">
            {formatTime(p.currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={p.duration || 0}
            step={0.5}
            value={p.currentTime}
            onChange={(e) => p.seek(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer"
          />
          <span className="w-10 tabular-nums">{formatTime(p.duration)}</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-8">
          <button onClick={p.prev} className="text-muted hover:text-white transition">
            <SkipBack className="size-7 fill-current" />
          </button>
          <button
            onClick={p.toggle}
            className="flex size-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
          >
            {p.isPlaying ? (
              <Pause className="size-6 fill-current" />
            ) : (
              <Play className="size-6 fill-current translate-x-[2px]" />
            )}
          </button>
          <button onClick={p.next} className="text-muted hover:text-white transition">
            <SkipForward className="size-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
