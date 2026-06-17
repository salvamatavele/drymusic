import {
  ArrowDownToLine,
  HandHeart,
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

const donateUrl =
  process.env.NEXT_PUBLIC_DONATE_URL ??
  "mailto:smatavele1@gmail.com?subject=Apoiar%20o%20DryMusic";

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

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/15 to-surface p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-black">
          <HandHeart className="size-7" />
        </span>
        <div>
          <h2 className="text-xl font-bold">Apoia o DryMusic 💚</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Este é um projeto independente, feito com dedicação. Se gostas e
            queres ajudar a melhorá-lo e a fazê-lo crescer, considera uma
            doação — qualquer valor faz a diferença e é totalmente opcional.
            Obrigado por fazeres parte! 🙏
          </p>
        </div>
        <a
          href={donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 font-bold text-black hover:bg-accent-hover transition"
        >
          <HandHeart className="size-5" />
          Fazer uma doação
        </a>
      </section>

      <footer className="flex items-center justify-center gap-2 text-sm text-muted">
        <Video className="size-4" />
        Feito com DryMusic
      </footer>
    </div>
  );
}
