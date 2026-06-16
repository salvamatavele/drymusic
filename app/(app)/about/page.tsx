import {
  ArrowDownToLine,
  Heart,
  ListMusic,
  Music2,
  Smartphone,
  Video,
  WifiOff,
} from "lucide-react";
import Logo from "@/components/Logo";
import ShareButton from "@/components/ShareButton";

export const metadata = { title: "Sobre" };

const features = [
  { icon: Music2, title: "Música e vídeos", text: "Ouve e assiste à tua biblioteca em streaming." },
  { icon: ListMusic, title: "Playlists", text: "Cria e organiza as tuas próprias playlists." },
  { icon: Heart, title: "Favoritos", text: "Marca o que gostas e encontra rápido." },
  { icon: ArrowDownToLine, title: "Downloads", text: "Descarrega para ouvir/ver offline." },
  { icon: WifiOff, title: "Funciona offline", text: "Reprodução mesmo sem internet (PWA)." },
  { icon: Smartphone, title: "Instalável", text: "Adiciona ao ecrã principal como uma app." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <Logo className="size-20 rounded-2xl shadow-2xl" />
        <div>
          <h1 className="text-3xl font-extrabold">DryMusic</h1>
          <p className="mt-1 text-muted">
            A tua biblioteca de música e vídeos — streaming, playlists e
            downloads offline, numa app instalável.
          </p>
        </div>
        <ShareButton
          title="DryMusic"
          text="Ouve músicas e assiste vídeos no DryMusic 🎵"
          path="/"
          label="Partilhar app"
        />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl bg-surface p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="flex items-center justify-center gap-2 text-sm text-muted">
        <Video className="size-4" />
        Feito com DryMusic
      </footer>
    </div>
  );
}
