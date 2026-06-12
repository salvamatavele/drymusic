"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LikeButton({
  id,
  liked: initialLiked,
  className = "",
  onChange,
}: {
  id: string;
  liked: boolean;
  className?: string;
  onChange?: (liked: boolean) => void;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const next = !liked;
    setLiked(next);
    onChange?.(next);
    const res = await fetch(`/api/media/${id}/like`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ liked: next }),
    });
    if (!res.ok) {
      setLiked(!next);
      onChange?.(!next);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={toggle}
      title={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`text-muted hover:text-white transition ${liked ? "!text-accent" : ""} ${className}`}
    >
      <Heart className={`size-5 ${liked ? "fill-accent" : ""}`} />
    </button>
  );
}
