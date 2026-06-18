"use client";

export type TrackType = "visit" | "download" | "install" | "apk";

/** Regista um evento de analytics (fire-and-forget). */
export function track(type: TrackType, mediaId?: string) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, mediaId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignora
  }
}
