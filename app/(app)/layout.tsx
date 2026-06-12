import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import PlayerProvider from "@/components/player/PlayerProvider";
import ExpandedPlayer from "@/components/player/ExpandedPlayer";
import PlayerBar from "@/components/PlayerBar";
import QueuePanel from "@/components/QueuePanel";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  return (
    <PlayerProvider>
      <div className="grid h-dvh grid-rows-[1fr_auto]">
        <div className="flex min-h-0">
          <Sidebar isAdmin={isAdmin} />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-8 md:p-6">
            {children}
          </main>
        </div>
        <div>
          <PlayerBar />
          <MobileNav />
        </div>
      </div>
      <QueuePanel />
      <ExpandedPlayer />
    </PlayerProvider>
  );
}
