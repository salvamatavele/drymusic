"use client";

import {
  ListMusic,
  Maximize2,
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
import { formatTime } from "@/lib/format";

export default function PlayerBar() {
  const p = usePlayer();
  if (!p.current) return null;

  const item = p.current;

  return (
    <footer className="border-t border-border bg-surface px-3 py-2 md:px-4 md:py-3">
      <div className="flex items-center gap-3 md:gap-6">
        {/* Esquerda: info da faixa */}
        <div
          className="flex min-w-0 flex-1 items-center gap-3 md:w-[30%] md:flex-none cursor-pointer"
          onClick={p.expand}
        >
          {item.type === "MUSIC" && (
            <Cover
              id={item.id}
              hasCover={item.hasCover}
              type={item.type}
              alt={item.title}
              className="size-12 rounded shrink-0"
            />
          )}
          {item.type === "VIDEO" && (
            <div className="size-12 shrink-0 rounded bg-elevated flex items-center justify-center text-[10px] text-muted">
              VÍDEO
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted">
              {item.artistName ?? "Desconhecido"}
            </p>
          </div>
          <span onClick={(e) => e.stopPropagation()} className="hidden sm:flex items-center gap-3 ml-1">
            <LikeButton
              key={`${item.id}-${item.liked}`}
              id={item.id}
              liked={item.liked}
              onChange={(liked) => p.updateCurrent({ liked })}
            />
            <DownloadButton item={item} />
          </span>
        </div>

        {/* Centro: controlos + seek */}
        <div className="flex flex-col items-center gap-1 md:flex-1">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={p.toggleShuffle}
              title="Aleatório"
              className={`hidden sm:block transition ${p.shuffle ? "text-accent" : "text-muted hover:text-white"}`}
            >
              <Shuffle className="size-4" />
            </button>
            <button
              onClick={p.prev}
              title="Anterior"
              className="text-muted hover:text-white transition"
            >
              <SkipBack className="size-5 fill-current" />
            </button>
            <button
              onClick={p.toggle}
              title={p.isPlaying ? "Pausar" : "Reproduzir"}
              className="flex size-9 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
            >
              {p.isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current translate-x-[1px]" />
              )}
            </button>
            <button
              onClick={p.next}
              title="Seguinte"
              className="text-muted hover:text-white transition"
            >
              <SkipForward className="size-5 fill-current" />
            </button>
            <button
              onClick={p.cycleRepeat}
              title={`Repetir: ${p.repeat}`}
              className={`hidden sm:block transition ${p.repeat !== "off" ? "text-accent" : "text-muted hover:text-white"}`}
            >
              {p.repeat === "one" ? (
                <Repeat1 className="size-4" />
              ) : (
                <Repeat className="size-4" />
              )}
            </button>
          </div>
          <div className="hidden w-full max-w-xl items-center gap-2 text-[11px] text-muted md:flex">
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
        </div>

        {/* Direita: volume, fila, expandir */}
        <div className="hidden items-center justify-end gap-3 md:flex md:w-[30%]">
          {item.type === "VIDEO" && (
            <select
              value={p.rate}
              onChange={(e) => p.setRate(Number(e.target.value))}
              title="Velocidade"
              className="rounded bg-elevated px-1 py-0.5 text-xs text-muted outline-none"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                <option key={r} value={r}>
                  {r}x
                </option>
              ))}
            </select>
          )}
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
            className="h-1 w-24 cursor-pointer"
          />
          <button
            onClick={p.expand}
            title="Expandir"
            className="text-muted hover:text-white transition"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>

        {/* Mobile: play/pause compacto já incluído no centro */}
      </div>

      {/* Seek mobile */}
      <input
        type="range"
        min={0}
        max={p.duration || 0}
        step={0.5}
        value={p.currentTime}
        onChange={(e) => p.seek(Number(e.target.value))}
        className="mt-1 h-1 w-full cursor-pointer md:hidden"
      />
    </footer>
  );
}
