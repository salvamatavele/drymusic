"use client";

import type { MediaDTO } from "@/lib/serialize";
import MediaCard from "@/components/MediaCard";

export default function MediaGrid({
  items,
  video = false,
}: {
  items: MediaDTO[];
  video?: boolean;
}) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted">Nada por aqui ainda.</p>;
  }
  return (
    <div
      className={
        video
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      }
    >
      {items.map((item) => (
        <MediaCard key={item.id} item={item} queue={items} />
      ))}
    </div>
  );
}
