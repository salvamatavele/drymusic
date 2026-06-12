import type { Media, Artist, Album, Playlist } from "@/generated/prisma/client";

export type MediaDTO = {
  id: string;
  type: "MUSIC" | "VIDEO";
  title: string;
  artistId: string | null;
  artistName: string | null;
  albumId: string | null;
  albumTitle: string | null;
  duration: number | null;
  mime: string;
  size: number;
  hasCover: boolean;
  liked: boolean;
  playCount: number;
  createdAt: string;
};

export type PlaylistDTO = {
  id: string;
  name: string;
  description: string | null;
  hasCover: boolean;
  itemCount: number;
  createdAt: string;
};

type MediaWithRelations = Media & {
  artist?: Artist | null;
  album?: Album | null;
};

export function toMediaDTO(
  m: MediaWithRelations,
  likedIds?: Set<string>,
): MediaDTO {
  return {
    id: m.id,
    type: m.type,
    title: m.title,
    artistId: m.artistId,
    artistName: m.artist?.name ?? null,
    albumId: m.albumId,
    albumTitle: m.album?.title ?? null,
    duration: m.duration,
    mime: m.mime,
    size: Number(m.size),
    hasCover: m.cover != null,
    liked: likedIds?.has(m.id) ?? false,
    playCount: m.playCount,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toPlaylistDTO(
  p: Playlist & { _count?: { items: number } },
): PlaylistDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    hasCover: p.cover != null,
    itemCount: p._count?.items ?? 0,
    createdAt: p.createdAt.toISOString(),
  };
}

export function streamUrl(id: string) {
  return `/api/media/${id}/stream`;
}

export function coverUrl(id: string) {
  return `/api/media/${id}/cover`;
}
