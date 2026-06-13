import {
  ArrowDownToLine,
  Clock,
  Disc3,
  Heart,
  Home,
  ListMusic,
  MicVocal,
  Music2,
  Search,
  Settings,
  Upload,
  Video,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };

export const mainLinks: NavLink[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/search", label: "Pesquisar", icon: Search },
];

export const libraryLinks: NavLink[] = [
  { href: "/music", label: "Músicas", icon: Music2 },
  { href: "/videos", label: "Vídeos", icon: Video },
  { href: "/artists", label: "Artistas", icon: MicVocal },
  { href: "/albums", label: "Álbuns", icon: Disc3 },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/liked", label: "Favoritos", icon: Heart },
  { href: "/history", label: "Histórico", icon: Clock },
  { href: "/downloads", label: "Downloads", icon: ArrowDownToLine },
];

export const adminLinks: NavLink[] = [
  { href: "/admin/upload", label: "Upload", icon: Upload },
  { href: "/admin", label: "Gerir biblioteca", icon: Settings },
];
