"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Regista uma visita (acesso) uma vez por sessão do browser. */
export default function AnalyticsTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("drymusic:visited")) return;
      sessionStorage.setItem("drymusic:visited", "1");
    } catch {
      // sessionStorage indisponível — regista na mesma
    }
    track("visit");
  }, []);

  return null;
}
