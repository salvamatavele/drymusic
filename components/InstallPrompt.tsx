"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, SquarePlus, X } from "lucide-react";
import Logo from "@/components/Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "drymusic:install";
const REDISPLAY_DAYS = 7; // re-mostra após dispensar (instalar = nunca mais)
const APK_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ??
  "https://apps.dryinov8.com/apps/drymusic/download";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** true se já houver uma ação guardada que deva suprimir o modal. */
function actionSaved(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { action, at } = JSON.parse(raw) as { action: string; at: number };
    if (action === "installed") return true;
    // dispensado: volta a mostrar passados REDISPLAY_DAYS
    return Date.now() - at < REDISPLAY_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function save(action: "installed" | "dismissed") {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ action, at: Date.now() }));
  } catch {
    // storage indisponível — ignora
  }
}

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const detect = () => {
      setIsAndroid(/android/i.test(ua));
      setIsIos(/iphone|ipad|ipod/i.test(ua));
    };

    // captura o evento nativo quando disponível (não dependemos dele para abrir)
    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      save("installed");
      setShow(false);
      setEvt(null);
    };
    // aberto manualmente pelo botão da barra (sempre, mesmo se já dispensado)
    const onOpen = () => {
      detect();
      setShowIosSteps(false);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("drymusic:open-install", onOpen);

    // abertura automática: só em produção, se não instalado nem já tratado
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (
      process.env.NODE_ENV === "production" &&
      !isStandalone() &&
      !actionSaved()
    ) {
      timer = setTimeout(() => {
        detect();
        setShow(true);
      }, 1200);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("drymusic:open-install", onOpen);
      if (timer) clearTimeout(timer);
    };
  }, []);

  async function installPwa() {
    if (evt) {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "accepted") save("installed");
      else save("dismissed");
      setEvt(null);
      setShow(false);
      return;
    }
    // sem evento nativo: instruções manuais
    if (isIos) {
      setShowIosSteps(true);
      return;
    }
    // Android/desktop sem prompt nativo
    alert(
      "Abre o menu do navegador (⋮) e escolhe “Instalar app” / “Adicionar ao ecrã principal”.",
    );
  }

  function installApk() {
    save("installed");
    window.open(APK_URL, "_blank", "noopener,noreferrer");
    setShow(false);
  }

  function dismiss() {
    save("dismissed");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute right-3 top-3 text-muted hover:text-white transition"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="size-16 rounded-2xl shadow-lg" />
          <h2 className="text-xl font-bold">Instalar o DryMusic</h2>
          <p className="text-sm text-muted">
            Instala a app no teu dispositivo para acederes mais rápido, ouvires
            offline e teres uma experiência de ecrã inteiro.
          </p>
        </div>

        {showIosSteps && (
          <p className="mt-4 flex flex-wrap items-center justify-center gap-1 rounded-lg bg-elevated p-3 text-xs text-muted">
            Toca em <Share className="inline size-4" /> e depois
            <span className="inline-flex items-center gap-1">
              <SquarePlus className="inline size-4" /> “Adicionar ao ecrã
              principal”.
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={installPwa}
            className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-bold text-black hover:bg-accent-hover transition"
          >
            <Download className="size-5" />
            Instalar app web (PWA)
          </button>

          {isAndroid && (
            <button
              onClick={installApk}
              className="flex items-center justify-center gap-2 rounded-full border border-accent px-5 py-3 font-bold text-accent hover:bg-accent/10 transition"
            >
              <Smartphone className="size-5" />
              Instalar app Android (.apk)
            </button>
          )}

          <button
            onClick={dismiss}
            className="py-1 text-sm text-muted hover:text-white transition"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
