import type { LucideIcon } from "lucide-react";
import { coverUrl } from "@/lib/serialize";

/**
 * Capa de uma coleção (álbum/playlist): usa a capa de uma faixa quando existe,
 * senão mostra um ícone placeholder.
 */
export default function CollectionCover({
  mediaId,
  icon: Icon,
  alt,
  className = "",
}: {
  mediaId: string | null;
  icon: LucideIcon;
  alt: string;
  className?: string;
}) {
  if (mediaId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl(mediaId)}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center bg-elevated text-muted ${className}`}
    >
      <Icon className="size-1/3" />
    </span>
  );
}
