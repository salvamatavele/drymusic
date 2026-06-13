"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "drymusic:install-dismissed";
const DISMISS_DAYS = 7;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function recentlyDismissed() {
  const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    const onInstalled = () => {
      setShow(false);
      setEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS não dispara beforeinstallprompt — mostra instruções manuais
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    const raf =
      isIos && isSafari
        ? requestAnimationFrame(() => {
            setIosHint(true);
            setShow(true);
          })
        : 0;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setShow(false);
    setEvt(null);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[60] mx-auto max-w-md rounded-xl border border-border bg-elevated p-4 shadow-2xl md:left-auto md:right-4 md:mx-0 md:w-80">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-black">
          <Download className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Instalar DryMusic</p>
          {iosHint ? (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
              Toca em <Share className="inline size-4" /> e depois
              <span className="inline-flex items-center gap-1">
                <SquarePlus className="inline size-4" /> “Adicionar ao ecrã
                principal”.
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Acede mais rápido e ouve offline, como uma app nativa.
            </p>
          )}
          {!iosHint && (
            <button
              onClick={install}
              className="mt-3 rounded-full bg-accent px-5 py-1.5 text-sm font-bold text-black hover:bg-accent-hover transition"
            >
              Instalar
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dispensar"
          className="text-muted hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
