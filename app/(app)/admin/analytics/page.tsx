import {
  ArrowDownToLine,
  Download,
  Eye,
  PlayCircle,
  Smartphone,
  Users,
} from "lucide-react";
import { getAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  const maxDay = Math.max(1, ...a.days.map((d) => d.visits));

  const cards = [
    { label: "Acessos (total)", value: a.totalVisits, sub: `${a.visits7} nos últimos 7 dias`, icon: Eye },
    { label: "Visitantes únicos", value: a.uniqueVisitors, sub: "dispositivos distintos", icon: Users },
    { label: "Downloads", value: a.totalDownloads, sub: `${a.downloads7} nos últimos 7 dias`, icon: Download },
    { label: "Reproduções", value: a.totalPlays, sub: `${a.plays7} nos últimos 7 dias`, icon: PlayCircle },
    { label: "Instalações (PWA)", value: a.totalInstalls, sub: "app adicionada ao dispositivo", icon: ArrowDownToLine },
    { label: "App Android (.apk)", value: a.totalApk, sub: `${a.apk7} nos últimos 7 dias`, icon: Smartphone },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold md:text-3xl">Analytics</h1>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-surface p-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-elevated text-accent">
              <c.icon className="size-5" />
            </span>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{c.value}</p>
            <p className="text-sm font-medium">{c.label}</p>
            <p className="text-xs text-muted">{c.sub}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Acessos — últimos 7 dias</h2>
        <div className="flex items-end gap-2 rounded-xl bg-surface p-4">
          {a.days.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-muted tabular-nums">{d.visits}</span>
              <div
                className="w-full rounded-t bg-accent"
                style={{ height: `${(d.visits / maxDay) * 80 + 4}px` }}
                title={`${d.day}: ${d.visits} acessos, ${d.downloads} downloads`}
              />
              <span className="text-[10px] text-muted">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-bold">Mais tocadas</h2>
          <ol className="flex flex-col gap-1">
            {a.topPlayed.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 rounded-md bg-surface px-3 py-2">
                <span className="w-5 text-center text-sm text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {m.title}
                  <span className="text-muted"> · {m.artist?.name ?? "—"}</span>
                </span>
                <span className="text-sm font-bold tabular-nums">{m.playCount}</span>
              </li>
            ))}
            {a.topPlayed.length === 0 && <p className="text-sm text-muted">Sem dados ainda.</p>}
          </ol>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold">Mais descarregadas</h2>
          <ol className="flex flex-col gap-1">
            {a.topDownloaded.map((d, i) => (
              <li key={d.media?.id ?? i} className="flex items-center gap-3 rounded-md bg-surface px-3 py-2">
                <span className="w-5 text-center text-sm text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {d.media?.title ?? "—"}
                  <span className="text-muted"> · {d.media?.artist?.name ?? "—"}</span>
                </span>
                <span className="text-sm font-bold tabular-nums">{d.count}</span>
              </li>
            ))}
            {a.topDownloaded.length === 0 && <p className="text-sm text-muted">Sem dados ainda.</p>}
          </ol>
        </div>
      </section>
    </div>
  );
}
