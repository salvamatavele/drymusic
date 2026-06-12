import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted">Esta página não existe.</p>
      <Link
        href="/"
        className="rounded-full bg-accent px-6 py-2 font-bold text-black hover:bg-accent-hover transition"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
