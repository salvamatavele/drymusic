"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/**
 * Botão de partilha: usa a Web Share API (nativa, sobretudo mobile) e, quando
 * indisponível, copia o link para a área de transferência.
 */
export default function ShareButton({
  title,
  path,
  text,
  className = "",
  label,
}: {
  title: string;
  /** caminho relativo, ex.: "/watch/<id>" ou "/" */
  path: string;
  text?: string;
  className?: string;
  /** se definido, mostra texto ao lado do ícone (ex.: "Partilhar app") */
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
      } catch {
        // partilha cancelada — ignora
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copia o link:", url);
    }
  }

  if (label) {
    return (
      <button
        onClick={share}
        className={`inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 font-bold text-black hover:bg-accent-hover transition ${className}`}
      >
        {copied ? <Check className="size-5" /> : <Share2 className="size-5" />}
        {copied ? "Link copiado!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={share}
      title={copied ? "Link copiado!" : "Partilhar"}
      className={`text-muted hover:text-white transition ${copied ? "!text-accent" : ""} ${className}`}
    >
      {copied ? <Check className="size-5" /> : <Share2 className="size-5" />}
    </button>
  );
}
