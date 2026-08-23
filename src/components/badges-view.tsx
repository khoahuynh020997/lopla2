import {
  Apple,
  Award,
  Flower2,
  Heart,
  Palette,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { KidAvatar } from "@/lib/avatars";
import { useAppStore, useClassAwarded, useClassStudents } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  heart: Heart,
  spark: Sparkles,
  hand: Award,
  palette: Palette,
  shield: Shield,
  star: Star,
  apple: Apple,
  flower: Flower2,
};

export function BadgesView() {
  const badges = useAppStore((s) => s.badges);
  const awarded = useClassAwarded();
  const students = useClassStudents();
  const awardBadge = useAppStore((s) => s.awardBadge);
  const revokeBadge = useAppStore((s) => s.revokeBadge);
  const [pick, setPick] = useState<string | null>(null);
  const badge = badges.find((b) => b.id === pick);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">Huy hiệu</h1>
        <p className="text-sm text-forest/60">Gắn danh hiệu cho bé ngoan, chăm, giúp bạn…</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b) => {
          const Icon = ICONS[b.icon] ?? Award;
          const n = awarded.filter((a) => a.badgeId === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setPick(b.id)}
              className="rounded-2xl bg-white p-4 text-left shadow-soft hover:bg-mist"
            >
              <Icon className="mb-2 size-7 text-gold-deep" />
              <p className="font-display text-lg">{b.name}</p>
              <p className="text-xs text-forest/60">{b.desc}</p>
              <p className="mt-2 text-sm font-bold text-leaf">{n} bé đang có</p>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-display text-xl">Đã trao</h2>
        <ul className="flex flex-col gap-2">
          {awarded.map((a) => {
            const st = students.find((s) => s.id === a.studentId);
            const b = badges.find((x) => x.id === a.badgeId);
            if (!st || !b) return null;
            return (
              <li key={a.id} className="flex items-center gap-2">
                <KidAvatar index={st.avatar} name={st.name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  <b>{st.name}</b> · {b.name}
                </span>
                <Button size="sm" variant="ghost" className="text-coral" onClick={() => revokeBadge(a.id)}>
                  Gỡ
                </Button>
              </li>
            );
          })}
          {awarded.length === 0 ? <li className="text-sm text-forest/50">Chưa trao huy hiệu nào.</li> : null}
        </ul>
      </section>

      <Modal open={Boolean(badge)} onOpenChange={(v) => !v && setPick(null)} title={`Trao: ${badge?.name ?? ""}`}>
        <ul className="flex max-h-80 flex-col gap-2 overflow-auto">
          {students.map((s) => {
            const has = awarded.some((a) => a.studentId === s.id && a.badgeId === pick);
            return (
              <li key={s.id} className="flex items-center gap-2">
                <KidAvatar index={s.avatar} name={s.name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.name}</span>
                <Button
                  size="sm"
                  disabled={has}
                  onClick={() => {
                    if (pick) awardBadge(s.id, pick);
                    setPick(null);
                  }}
                >
                  {has ? "Đã có" : "Trao"}
                </Button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
