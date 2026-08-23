import {
  Award,
  BarChart3,
  Gift,
  Home,
  Menu,
  Trophy,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { startMusic, stopMusic } from "@/lib/music";
import { useActiveClass, useAppStore, useClassStudents } from "@/lib/store";
import type { ViewId } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: { id: ViewId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Trang chủ", icon: Home },
  { id: "students", label: "Học sinh", icon: Users },
  { id: "groups", label: "Nhóm / Tổ", icon: UsersRound },
  { id: "compete", label: "Thi đua", icon: Trophy },
  { id: "rewards", label: "Phần thưởng", icon: Gift },
  { id: "reports", label: "Báo cáo", icon: BarChart3 },
  { id: "badges", label: "Huy hiệu", icon: Award },
  { id: "fees", label: "Các khoản thu", icon: Wallet },
];

export function AppShell({ children }: { children: ReactNode }) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const musicOn = useAppStore((s) => s.musicOn);
  const room = useActiveClass();
  const count = useClassStudents().length;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (musicOn) void startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [musicOn]);

  return (
    <div className="flex min-h-dvh bg-cream">
      <aside className="hidden w-56 shrink-0 flex-col bg-leaf-deep text-cream lg:flex">
        <div className="px-4 pt-6 pb-4">
          <p className="font-display text-2xl leading-none">{room?.name ?? "Lớp"}</p>
          <p className="mt-1 text-xs text-gold">{room?.teachers}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <NavBtn key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
          ))}
        </nav>
        <p className="px-4 py-4 text-xs text-cream/70">{count} học sinh</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-forest/8 bg-white/80 px-3 py-2 backdrop-blur lg:px-6">
          <button
            className="inline-flex size-11 items-center justify-center rounded-xl lg:hidden hover:bg-mist"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-lg leading-tight lg:text-xl">{room?.name}</p>
            <p className="truncate text-xs text-forest/60">
              {room?.teachers} · Năm học {room?.year}
            </p>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-3 pb-24 lg:p-6 lg:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-forest/8 bg-white px-1 py-1 lg:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "flex min-w-16 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold",
              view === item.id ? "text-leaf" : "text-forest/50",
            )}
          >
            <item.icon className="size-5" />
            {item.label.split(" ")[0]}
          </button>
        ))}
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-forest/40" onClick={() => setOpen(false)} aria-label="Đóng" />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-leaf-deep text-cream">
            <div className="flex items-center justify-between px-4 py-4">
              <p className="font-display text-2xl">{room?.name ?? "Lớp"}</p>
              <Button variant="ghost" size="icon" className="text-cream" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 px-3">
              {NAV.map((item) => (
                <NavBtn
                  key={item.id}
                  item={item}
                  active={view === item.id}
                  onClick={() => {
                    setView(item.id);
                    setOpen(false);
                  }}
                />
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavBtn({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors",
        active ? "bg-gold text-forest" : "text-cream/90 hover:bg-white/10",
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </button>
  );
}
