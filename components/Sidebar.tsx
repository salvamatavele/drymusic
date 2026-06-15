"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Settings } from "lucide-react";
import { adminLinks, libraryLinks, mainLinks } from "@/components/nav-links";
import Logo from "@/components/Logo";

type SidebarProps = { isAdmin: boolean };

function NavItemBottom({ pathname }: { pathname: string }) {
  return (
    <Link
      href="/admin"
      className={`mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
        pathname === "/login" ? "text-white" : "text-muted hover:text-white"
      }`}
    >
      <Settings className="size-5" />
      Admin
    </Link>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-elevated text-white" : "text-muted hover:text-white"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

export default function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <nav className="hidden h-full w-64 flex-col gap-2 overflow-y-auto bg-surface p-3 md:flex">
      <Link href="/" className="flex items-center gap-2 px-3 py-3">
        <Logo className="size-9 rounded-lg" />
        <span className="text-lg font-bold">DryMusic</span>
      </Link>

      <div className="flex flex-col gap-1">
        {mainLinks.map((l) => (
          <NavItem key={l.href} {...l} active={pathname === l.href} />
        ))}
      </div>

      <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-muted">
        Biblioteca
      </p>
      <div className="flex flex-col gap-1">
        {libraryLinks.map((l) => (
          <NavItem
            key={l.href}
            {...l}
            active={pathname === l.href || pathname.startsWith(`${l.href}/`)}
          />
        ))}
      </div>

      {isAdmin && (
        <>
          <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-muted">
            Admin
          </p>
          <div className="flex flex-col gap-1">
            {adminLinks.map((l) => (
              <NavItem key={l.href} {...l} active={pathname === l.href} />
            ))}
          </div>
        </>
      )}

      {isAdmin ? (
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-white transition"
        >
          <LogOut className="size-5" />
          Sair do admin
        </button>
      ) : (
        <NavItemBottom pathname={pathname} />
      )}
    </nav>
  );
}
