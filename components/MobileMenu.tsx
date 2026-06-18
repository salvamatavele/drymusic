"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, X } from "lucide-react";
import {
  adminLinks,
  libraryLinks,
  mainLinks,
  type NavLink,
} from "@/components/nav-links";
import Logo from "@/components/Logo";
import InstallButton from "@/components/InstallButton";

type Props = { isAdmin: boolean };

export default function MobileMenu({ isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  const Item = ({ href, label, icon: Icon }: NavLink) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
          active ? "bg-elevated text-white" : "text-muted hover:text-white"
        }`}
      >
        <Icon className="size-5" />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Barra superior — só mobile, fixa no topo */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="text-white"
        >
          <Menu className="size-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-7 rounded-md" />
          <span className="font-bold">DryMusic</span>
        </Link>
        <InstallButton className="ml-auto" />
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col gap-1 overflow-y-auto bg-surface p-3">
            <div className="mb-2 flex items-center justify-between px-1 py-2">
              <span className="flex items-center gap-2">
                <Logo className="size-8 rounded-md" />
                <span className="text-lg font-bold">DryMusic</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-muted hover:text-white"
              >
                <X className="size-6" />
              </button>
            </div>

            {mainLinks.map((l) => (
              <Item key={l.href} {...l} />
            ))}

            <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-muted">
              Biblioteca
            </p>
            {libraryLinks.map((l) => (
              <Item key={l.href} {...l} />
            ))}

            {isAdmin ? (
              <>
                <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Admin
                </p>
                {adminLinks.map((l) => (
                  <Item key={l.href} {...l} />
                ))}
                <button
                  onClick={logout}
                  className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:text-white transition"
                >
                  <LogOut className="size-5" />
                  Sair do admin
                </button>
              </>
            ) : (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:text-white transition"
              >
                <Settings className="size-5" />
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
