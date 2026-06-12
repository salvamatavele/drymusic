"use client";

import { Music2, Video } from "lucide-react";
import { coverUrl } from "@/lib/serialize";

export default function Cover({
  id,
  hasCover,
  type,
  alt,
  className = "",
}: {
  id: string;
  hasCover: boolean;
  type: "MUSIC" | "VIDEO";
  alt: string;
  className?: string;
}) {
  if (hasCover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl(id)}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  const Icon = type === "VIDEO" ? Video : Music2;
  return (
    <div
      className={`flex items-center justify-center bg-elevated text-muted ${className}`}
    >
      <Icon className="size-1/3 min-size-4" />
    </div>
  );
}
