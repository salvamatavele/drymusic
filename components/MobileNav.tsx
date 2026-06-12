"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownToLine, Home, ListMusic, Search } from "lucide-react";

const links = [
  { href: "/", label: "Início", icon: Home },
  { href: "/search", label: "Pesquisar", icon: Search },
  { href: "/music", label: "Biblioteca", icon: ListMusic },
  { href: "/downloads", label: "Downloads", icon: ArrowDownToLine },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              active ? "text-white" : "text-muted"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
