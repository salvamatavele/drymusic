"use client";

import {
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/Cover";
import LikeButton from "@/components/LikeButton";
import DownloadButton from "@/components/DownloadButton";
import AddToPlaylistMenu from "@/components/AddToPlaylistMenu";
import ShareButton from "@/components/ShareButton";
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
          <ShareButton
            title={item.title}
            text={`${item.title}${item.artistName ? ` — ${item.artistName}` : ""}`}
            path={`/watch/${item.id}`}
          />
          <AddToPlaylistMenu item={item} />
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

        {/* Controlos principais */}
        <div className="mt-4 flex items-center justify-center gap-7">
          <button
            onClick={p.toggleShuffle}
            title="Aleatório"
            className={`transition ${p.shuffle ? "text-accent" : "text-muted hover:text-white"}`}
          >
            <Shuffle className="size-6" />
          </button>
          <button onClick={p.prev} className="text-muted hover:text-white transition">
            <SkipBack className="size-7 fill-current" />
          </button>
          <button
            onClick={p.toggle}
            className="flex size-16 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
          >
            {p.isPlaying ? (
              <Pause className="size-7 fill-current" />
            ) : (
              <Play className="size-7 fill-current translate-x-[2px]" />
            )}
          </button>
          <button onClick={p.next} className="text-muted hover:text-white transition">
            <SkipForward className="size-7 fill-current" />
          </button>
          <button
            onClick={p.cycleRepeat}
            title={`Repetir: ${p.repeat}`}
            className={`transition ${p.repeat !== "off" ? "text-accent" : "text-muted hover:text-white"}`}
          >
            {p.repeat === "one" ? (
              <Repeat1 className="size-6" />
            ) : (
              <Repeat className="size-6" />
            )}
          </button>
        </div>

        {/* Ações secundárias: fila, volume, velocidade */}
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            onClick={p.toggleQueue}
            title="Fila"
            className={`transition ${p.queueOpen ? "text-accent" : "text-muted hover:text-white"}`}
          >
            <ListMusic className="size-5" />
          </button>
          <button
            onClick={() => p.setVolume(p.volume > 0 ? 0 : 1)}
            title="Silenciar"
            className="text-muted hover:text-white transition"
          >
            {p.volume === 0 ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            className="h-1 w-32 cursor-pointer"
          />
          {isVideo && (
            <select
              value={p.rate}
              onChange={(e) => p.setRate(Number(e.target.value))}
              title="Velocidade"
              className="rounded bg-elevated px-2 py-1 text-xs text-muted outline-none"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                <option key={r} value={r}>
                  {r}x
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
