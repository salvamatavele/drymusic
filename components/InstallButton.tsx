"use client";

import { Download } from "lucide-react";

/** Dispara o modal de instalação (escutado por InstallPrompt). */
export function openInstallModal() {
  window.dispatchEvent(new Event("drymusic:open-install"));
}

export default function InstallButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button
      onClick={openInstallModal}
      title="Instalar app"
      aria-label="Instalar app"
      className={`text-muted hover:text-white transition ${className}`}
    >
      <Download className="size-6" />
    </button>
  );
}
