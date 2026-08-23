import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { BadgesView } from "@/components/badges-view";
import { CompeteView } from "@/components/compete-view";
import { FeesView } from "@/components/fees-view";
import { GroupsView } from "@/components/groups-view";
import { HomeView } from "@/components/home-view";
import { ReportsView } from "@/components/reports-view";
import { RewardsView } from "@/components/rewards-view";
import { StudentsView } from "@/components/students-view";
import { useAppStore } from "@/lib/store";

export function App() {
  const hydrated = useAppStore((s) => s.hydrated);
  const view = useAppStore((s) => s.view);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      useAppStore.getState().setHydrated(true);
    });
    void useAppStore.persist.rehydrate();
    if (useAppStore.persist.hasHydrated()) {
      useAppStore.getState().setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <p className="font-display text-2xl text-leaf">Lớp Lá 2 đang mở...</p>
      </div>
    );
  }

  return (
    <AppShell>
      {view === "home" ? <HomeView /> : null}
      {view === "students" ? <StudentsView /> : null}
      {view === "groups" ? <GroupsView /> : null}
      {view === "compete" ? <CompeteView /> : null}
      {view === "rewards" ? <RewardsView /> : null}
      {view === "reports" ? <ReportsView /> : null}
      {view === "badges" ? <BadgesView /> : null}
      {view === "fees" ? <FeesView /> : null}
    </AppShell>
  );
}
