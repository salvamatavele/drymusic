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

const PLAYER_STORAGE_KEY = "drymusic:player";

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
  // elemento <audio> dedicado para música — continua a tocar em segundo
  // plano/ecrã bloqueado (os <video> são pausados pelos browsers móveis).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // elemento atualmente em uso (áudio p/ música, vídeo p/ vídeo)
  const activeElRef = useRef<HTMLMediaElement | null>(null);
  const volumeRef = useRef(1);
  const rateRef = useRef(1);
  const lastPosSync = useRef(0);
  const baseQueue = useRef<MediaDTO[]>([]);
  // posição a aplicar quando os metadados da faixa restaurada carregarem
  const pendingSeekRef = useRef<number | null>(null);
  const restoredRef = useRef(false);

  const elementFor = (item: MediaDTO) =>
    item.type === "VIDEO" ? videoRef.current : audioRef.current;

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

  const setSessionMetadata = useCallback((item: MediaDTO) => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title,
      artist: item.artistName ?? "",
      album: item.albumTitle ?? "",
      artwork: item.hasCover
        ? [
            { src: coverUrl(item.id), sizes: "256x256", type: "image/jpeg" },
            { src: coverUrl(item.id), sizes: "512x512", type: "image/jpeg" },
          ]
        : [],
    });
  }, []);

  // Mantém o scrubber do ecrã bloqueado sincronizado e a sessão "viva".
  const syncPositionState = useCallback((force = false) => {
    if (
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    )
      return;
    const el = activeElRef.current;
    if (!el || !isFinite(el.duration) || el.duration <= 0) return;
    const now = Date.now();
    if (!force && now - lastPosSync.current < 1000) return;
    lastPosSync.current = now;
    try {
      navigator.mediaSession.setPositionState({
        duration: el.duration,
        playbackRate: el.playbackRate || 1,
        position: Math.min(Math.max(el.currentTime, 0), el.duration),
      });
    } catch {
      // valores inválidos durante transições — ignora
    }
  }, []);

  const loadAndPlay = useCallback(
    (item: MediaDTO) => {
      const el = elementFor(item);
      if (!el) return;
      // pausa/limpa o outro elemento para não haver dois a tocar
      const other = item.type === "VIDEO" ? audioRef.current : videoRef.current;
      activeElRef.current = el;
      if (other && other !== el) {
        other.pause();
        other.removeAttribute("src");
        other.load();
      }
      el.volume = volumeRef.current;
      el.playbackRate = item.type === "VIDEO" ? rateRef.current : 1;
      el.src = streamUrl(item.id);
      el.play().catch(() => setIsPlaying(false));
      fetch(`/api/media/${item.id}/played`, { method: "POST" }).catch(() => {});
      setSessionMetadata(item);
    },
    [setSessionMetadata],
  );

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
      activeElRef.current?.pause();
      setIsPlaying(false);
    }
  }, [jumpTo]);

  const prev = useCallback(() => {
    const el = activeElRef.current;
    const { index: i } = stateRef.current;
    if (el && (el.currentTime > 3 || i === 0)) {
      el.currentTime = 0;
      return;
    }
    jumpTo(i - 1);
  }, [jumpTo]);

  const toggle = useCallback(() => {
    const el = activeElRef.current;
    if (!el || !el.src) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, []);

  const seek = useCallback((t: number) => {
    const el = activeElRef.current;
    if (el) el.currentTime = t;
  }, []);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    if (videoRef.current) videoRef.current.volume = v;
    if (audioRef.current) audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  const setRate = useCallback((r: number) => {
    rateRef.current = r;
    if (activeElRef.current) activeElRef.current.playbackRate = r;
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

  // listeners — ligados a AMBOS os elementos (áudio e vídeo); ignoram eventos
  // do elemento inativo via guarda contra activeElRef.
  useEffect(() => {
    const els = [videoRef.current, audioRef.current].filter(
      Boolean,
    ) as HTMLMediaElement[];
    const setPlaybackState = (s: MediaSessionPlaybackState) => {
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = s;
    };
    const cleanups: Array<() => void> = [];

    for (const el of els) {
      const active = () => el === activeElRef.current;
      const onPlay = () => {
        if (!active()) return;
        setIsPlaying(true);
        setPlaybackState("playing");
        syncPositionState(true);
      };
      const onPause = () => {
        if (!active()) return;
        setIsPlaying(false);
        setPlaybackState("paused");
      };
      const onTime = () => {
        if (!active()) return;
        setCurrentTime(el.currentTime);
        syncPositionState(false);
      };
      const onDuration = () => {
        if (!active()) return;
        setDuration(el.duration || 0);
        if (pendingSeekRef.current != null) {
          try {
            el.currentTime = pendingSeekRef.current;
          } catch {
            // ignora se ainda não for possível
          }
          pendingSeekRef.current = null;
        }
        syncPositionState(true);
      };
      const onEnded = () => {
        if (!active()) return;
        if (stateRef.current.repeat === "one") {
          el.currentTime = 0;
          el.play().catch(() => {});
        } else {
          next();
        }
      };
      const onError = () => {
        if (!active()) return;
        next();
      };
      const onRate = () => {
        if (!active()) return;
        syncPositionState(true);
      };

      el.addEventListener("play", onPlay);
      el.addEventListener("pause", onPause);
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("loadedmetadata", onDuration);
      el.addEventListener("durationchange", onDuration);
      el.addEventListener("ratechange", onRate);
      el.addEventListener("seeked", onRate);
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
      cleanups.push(() => {
        el.removeEventListener("play", onPlay);
        el.removeEventListener("pause", onPause);
        el.removeEventListener("timeupdate", onTime);
        el.removeEventListener("loadedmetadata", onDuration);
        el.removeEventListener("durationchange", onDuration);
        el.removeEventListener("ratechange", onRate);
        el.removeEventListener("seeked", onRate);
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
      });
    }
    return () => cleanups.forEach((c) => c());
  }, [next, syncPositionState]);

  // Media Session actions (controlos do ecrã bloqueado / notificação)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const set = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // ação não suportada neste browser — ignora
      }
    };
    set("play", () => activeElRef.current?.play());
    set("pause", () => activeElRef.current?.pause());
    set("previoustrack", () => prev());
    set("nexttrack", () => next());
    set("seekto", (e) => {
      if (e.seekTime != null) seek(e.seekTime);
    });
    set("seekbackward", (e) =>
      seek(
        Math.max(0, (activeElRef.current?.currentTime ?? 0) - (e.seekOffset ?? 10)),
      ),
    );
    set("seekforward", (e) =>
      seek((activeElRef.current?.currentTime ?? 0) + (e.seekOffset ?? 10)),
    );
    set("stop", () => activeElRef.current?.pause());
    return () => {
      for (const a of [
        "play",
        "pause",
        "previoustrack",
        "nexttrack",
        "seekto",
        "seekbackward",
        "seekforward",
        "stop",
      ] as MediaSessionAction[]) {
        set(a, null);
      }
    };
  }, [prev, next, seek]);

  // ── Persistência: retomar a reprodução após reload ──
  // Restaura a fila/posição ao montar (faixa carregada na posição guardada;
  // o áudio pode ficar em pausa se o browser bloquear autoplay com som).
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    let saved: {
      queue?: MediaDTO[];
      baseQueue?: MediaDTO[];
      index?: number;
      currentTime?: number;
      volume?: number;
      rate?: number;
      shuffle?: boolean;
      repeat?: RepeatMode;
    } | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || "null");
    } catch {
      saved = null;
    }
    if (!saved?.queue?.length) return;
    const session = saved;

    const raf = requestAnimationFrame(() => {
      const q = session.queue!;
      const idx = Math.min(Math.max(session.index ?? 0, 0), q.length - 1);
      const item = q[idx];
      baseQueue.current = session.baseQueue?.length ? session.baseQueue : q;
      setQueue(q);
      setIndex(idx);
      if (typeof session.volume === "number") setVolume(session.volume);
      if (typeof session.rate === "number") setRate(session.rate);
      if (session.shuffle) setShuffle(true);
      if (session.repeat) setRepeat(session.repeat);

      const el = item ? elementFor(item) : null;
      if (el && item) {
        activeElRef.current = el;
        el.volume = volumeRef.current;
        el.playbackRate = item.type === "VIDEO" ? rateRef.current : 1;
        el.src = streamUrl(item.id);
        pendingSeekRef.current = session.currentTime ?? 0;
        setCurrentTime(session.currentTime ?? 0);
        setDuration(item.duration ?? 0);
        setSessionMetadata(item);
        // tenta retomar; se o autoplay com som for bloqueado, fica em pausa
        el.play().catch(() => {});
      }
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda o estado periodicamente e imediatamente antes de sair/recarregar.
  const persistRef = useRef({ queue, index, volume, rate, shuffle, repeat });
  useEffect(() => {
    persistRef.current = { queue, index, volume, rate, shuffle, repeat };
  }, [queue, index, volume, rate, shuffle, repeat]);

  useEffect(() => {
    const save = () => {
      const s = persistRef.current;
      if (!s.queue.length) return;
      try {
        localStorage.setItem(
          PLAYER_STORAGE_KEY,
          JSON.stringify({
            ...s,
            baseQueue: baseQueue.current,
            currentTime: activeElRef.current?.currentTime ?? 0,
          }),
        );
      } catch {
        // localStorage cheio/indisponível — ignora
      }
    };
    const interval = setInterval(save, 5000);
    document.addEventListener("visibilitychange", save);
    window.addEventListener("pagehide", save);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", save);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, []);

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
      {/* elemento de áudio persistente para música (continua em background) */}
      <audio ref={audioRef} preload="auto" />
    </PlayerContext.Provider>
  );
}
