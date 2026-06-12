"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MediaDTO } from "@/lib/serialize";
import { streamUrl, coverUrl } from "@/lib/serialize";

export type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  current: MediaDTO | null;
  queue: MediaDTO[];
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
  shuffle: boolean;
  repeat: RepeatMode;
  expanded: boolean;
  queueOpen: boolean;
};

type PlayerApi = PlayerState & {
  play: (item: MediaDTO, queue?: MediaDTO[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setRate: (r: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: (item: MediaDTO) => void;
  addToQueue: (item: MediaDTO) => void;
  removeFromQueue: (i: number) => void;
  jumpTo: (i: number) => void;
  clearQueue: () => void;
  expand: () => void;
  collapse: () => void;
  toggleQueue: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  updateCurrent: (patch: Partial<MediaDTO>) => void;
};

const PlayerContext = createContext<PlayerApi | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer fora de PlayerProvider");
  return ctx;
}

function shuffleQueue(queue: MediaDTO[], currentIdx: number): MediaDTO[] {
  const rest = queue.filter((_, i) => i !== currentIdx);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [queue[currentIdx], ...rest];
}

export default function PlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const baseQueue = useRef<MediaDTO[]>([]);

  const [queue, setQueue] = useState<MediaDTO[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [rate, setRateState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const current = queue[index] ?? null;

  // refs para handlers estáveis no elemento de media
  const stateRef = useRef({ queue, index, repeat });
  useEffect(() => {
    stateRef.current = { queue, index, repeat };
  }, [queue, index, repeat]);

  const loadAndPlay = useCallback((item: MediaDTO) => {
    const el = videoRef.current;
    if (!el) return;
    el.src = streamUrl(item.id);
    el.play().catch(() => setIsPlaying(false));
    fetch(`/api/media/${item.id}/played`, { method: "POST" }).catch(() => {});
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: item.artistName ?? "",
        album: item.albumTitle ?? "",
        artwork: item.hasCover
          ? [{ src: coverUrl(item.id), sizes: "512x512" }]
          : [],
      });
    }
  }, []);

  const play = useCallback(
    (item: MediaDTO, newQueue?: MediaDTO[]) => {
      const q = newQueue && newQueue.length ? newQueue : [item];
      const i = Math.max(
        q.findIndex((m) => m.id === item.id),
        0,
      );
      baseQueue.current = q;
      setQueue(shuffle ? shuffleQueue(q, i) : q);
      setIndex(shuffle ? 0 : i);
      loadAndPlay(item);
    },
    [shuffle, loadAndPlay],
  );

  const jumpTo = useCallback(
    (i: number) => {
      const { queue: q } = stateRef.current;
      if (!q[i]) return;
      setIndex(i);
      loadAndPlay(q[i]);
    },
    [loadAndPlay],
  );

  const next = useCallback(() => {
    const { queue: q, index: i, repeat: r } = stateRef.current;
    if (!q.length) return;
    if (i + 1 < q.length) {
      jumpTo(i + 1);
    } else if (r === "all") {
      jumpTo(0);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [jumpTo]);

  const prev = useCallback(() => {
    const el = videoRef.current;
    const { index: i } = stateRef.current;
    if (el && (el.currentTime > 3 || i === 0)) {
      el.currentTime = 0;
      return;
    }
    jumpTo(i - 1);
  }, [jumpTo]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.src) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, []);

  const seek = useCallback((t: number) => {
    const el = videoRef.current;
    if (el) el.currentTime = t;
  }, []);

  const setVolume = useCallback((v: number) => {
    const el = videoRef.current;
    if (el) el.volume = v;
    setVolumeState(v);
  }, []);

  const setRate = useCallback((r: number) => {
    const el = videoRef.current;
    if (el) el.playbackRate = r;
    setRateState(r);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const { queue: q, index: i } = stateRef.current;
      if (!q.length) return !s;
      if (!s) {
        baseQueue.current = q;
        setQueue(shuffleQueue(q, i));
        setIndex(0);
      } else {
        const cur = q[i];
        const orig = baseQueue.current;
        const origIdx = Math.max(
          orig.findIndex((m) => m.id === cur?.id),
          0,
        );
        setQueue(orig);
        setIndex(origIdx);
      }
      return !s;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  const playNext = useCallback((item: MediaDTO) => {
    const { queue: q, index: i } = stateRef.current;
    if (!q.length) {
      baseQueue.current = [item];
      setQueue([item]);
      setIndex(0);
      return;
    }
    setQueue([...q.slice(0, i + 1), item, ...q.slice(i + 1)]);
  }, []);

  const addToQueue = useCallback((item: MediaDTO) => {
    const { queue: q } = stateRef.current;
    if (!q.length) {
      baseQueue.current = [item];
      setQueue([item]);
      setIndex(0);
      return;
    }
    setQueue([...q, item]);
  }, []);

  const removeFromQueue = useCallback((i: number) => {
    const { queue: q, index: cur } = stateRef.current;
    if (i === cur) return; // não remover a faixa atual
    setQueue(q.filter((_, idx) => idx !== i));
    if (i < cur) setIndex(cur - 1);
  }, []);

  const clearQueue = useCallback(() => {
    const { queue: q, index: i } = stateRef.current;
    if (!q.length) return;
    setQueue(q[i] ? [q[i]] : []);
    setIndex(0);
  }, []);

  const updateCurrent = useCallback((patch: Partial<MediaDTO>) => {
    const { queue: q, index: i } = stateRef.current;
    if (!q[i]) return;
    const updated = { ...q[i], ...patch };
    setQueue(q.map((m, idx) => (idx === i ? updated : m)));
  }, []);

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);
  const toggleQueue = useCallback(() => setQueueOpen((o) => !o), []);

  // listeners do elemento de media
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(el.currentTime);
    const onDuration = () => setDuration(el.duration || 0);
    const onEnded = () => {
      if (stateRef.current.repeat === "one") {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        next();
      }
    };
    const onError = () => next();

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onDuration);
    el.addEventListener("durationchange", onDuration);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onDuration);
      el.removeEventListener("durationchange", onDuration);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [next]);

  // Media Session actions
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => videoRef.current?.play());
    ms.setActionHandler("pause", () => videoRef.current?.pause());
    ms.setActionHandler("previoustrack", prev);
    ms.setActionHandler("nexttrack", next);
    ms.setActionHandler("seekto", (e) => {
      if (e.seekTime != null) seek(e.seekTime);
    });
    return () => {
      ms.setActionHandler("play", null);
      ms.setActionHandler("pause", null);
      ms.setActionHandler("previoustrack", null);
      ms.setActionHandler("nexttrack", null);
      ms.setActionHandler("seekto", null);
    };
  }, [prev, next, seek]);

  const api = useMemo<PlayerApi>(
    () => ({
      current,
      queue,
      index,
      isPlaying,
      currentTime,
      duration,
      volume,
      rate,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      play,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setRate,
      toggleShuffle,
      cycleRepeat,
      playNext,
      addToQueue,
      removeFromQueue,
      jumpTo,
      clearQueue,
      expand,
      collapse,
      toggleQueue,
      videoRef,
      updateCurrent,
    }),
    [
      current,
      queue,
      index,
      isPlaying,
      currentTime,
      duration,
      volume,
      rate,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      play,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setRate,
      toggleShuffle,
      cycleRepeat,
      playNext,
      addToQueue,
      removeFromQueue,
      jumpTo,
      clearQueue,
      expand,
      collapse,
      toggleQueue,
      updateCurrent,
    ],
  );

  const isVideo = current?.type === "VIDEO";

  return (
    <PlayerContext.Provider value={api}>
      {children}
      {/*
        Elemento de media único e persistente: nunca desmonta, por isso a
        reprodução não reinicia ao navegar nem ao expandir/colapsar.
      */}
      <div
        className={
          expanded
            ? `fixed left-0 right-0 top-16 bottom-64 z-[55] flex items-center justify-center pointer-events-none ${isVideo ? "" : "hidden"}`
            : isVideo && current
              ? "fixed bottom-28 right-4 z-40 w-64 max-w-[60vw] rounded-lg overflow-hidden shadow-2xl cursor-pointer"
              : "hidden"
        }
      >
        <video
          ref={videoRef}
          playsInline
          className={
            expanded
              ? "max-h-full max-w-full"
              : "w-full aspect-video object-contain bg-black"
          }
          onClick={expanded ? undefined : expand}
        />
      </div>
    </PlayerContext.Provider>
  );
}
