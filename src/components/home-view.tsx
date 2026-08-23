import { Medal, Music, Music2, RotateCcw, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import {
  useActiveClass,
  useAppStore,
  useClassStudents,
} from "@/lib/store";
import { cn, todayLabel } from "@/lib/utils";
import { NamePickerButton } from "./name-picker";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { ClassSwitcher } from "./class-switcher";

export function HomeView() {
  const room = useActiveClass();
  const students = useClassStudents();
  const musicOn = useAppStore((s) => s.musicOn);
  const setMusic = useAppStore((s) => s.setMusic);
  const setView = useAppStore((s) => s.setView);
  const resetPoints = useAppStore((s) => s.resetPoints);
  const [resetOpen, setResetOpen] = useState(false);
  const events = useAppStore((s) => s.events);
  const redemptions = useAppStore((s) => s.redemptions);

  const ranked = useMemo(() => {
    const ptsFor = (id: string) =>
      events.filter((e) => e.studentId === id).reduce((n, e) => n + e.delta, 0) -
      redemptions.filter((r) => r.studentId === id).reduce((n, r) => n + r.cost, 0);
    return students
      .map((st) => ({ st, pts: ptsFor(st.id) }))
      .sort((a, b) => b.pts - a.pts || a.st.name.localeCompare(b.st.name, "vi"));
  }, [students, events, redemptions]);
  const top5 = ranked.slice(0, 5);
  const total = ranked.reduce((n, r) => n + Math.max(0, r.pts), 0);
  const goal = Math.max(30, students.length * 5);
  const pct = Math.min(100, Math.round((total / goal) * 100));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Banner />

      <div className="flex flex-wrap items-center gap-2">
        <ClassSwitcher />
        <Button variant="outline" onClick={() => setView("reports")}>
          <Table2 className="size-4" />
          Bảng điểm
        </Button>
        <Button variant="coral" onClick={() => setResetOpen(true)}>
          <RotateCcw className="size-4" />
          Đặt lại
        </Button>
        <Button variant={musicOn ? "gold" : "cream"} onClick={() => setMusic(!musicOn)}>
          {musicOn ? <Music2 className="size-4" /> : <Music className="size-4" />}
          {musicOn ? "Tắt nhạc" : "Bật nhạc"}
        </Button>
        <NamePickerButton />
      </div>

      <p className="text-sm text-forest/60 capitalize">{todayLabel()}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl bg-leaf-deep p-5 text-cream shadow-soft">
          <p className="text-sm font-bold tracking-wide text-gold">ĐIỂM VÒNG NGUYỆT QUẾ</p>
          <p className="mt-2 font-display text-5xl tabular-nums">{total}</p>
          <p className="mt-1 text-sm text-cream/70">
            Cả lớp · mục tiêu tuần {goal} điểm
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-cream/80">
            {room?.name} — cùng nhau học tập thật tốt, tích điểm thật nhiều, nhận huy hiệu, đổi phần thưởng mỗi ngày.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Medal className="size-5 text-gold-deep" />
            <h2 className="font-display text-xl">Top 5 học sinh xuất sắc</h2>
          </div>
          {top5.length === 0 ? (
            <p className="text-sm text-forest/60">Chưa có học sinh. Vào mục Học sinh để nhập danh sách.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {top5.map((row, i) => (
                <li
                  key={row.st.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2 py-2",
                    i === 0 ? "bg-gold/20" : "bg-mist/60",
                  )}
                >
                  <span className="w-6 text-center font-display text-lg tabular-nums text-leaf-deep">{i + 1}</span>
                  <KidAvatar index={row.st.avatar} name={row.st.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{row.st.name}</p>
                    <p className="text-xs text-forest/55">Lớp Lá 2</p>
                  </div>
                  <span className="font-display text-lg tabular-nums text-leaf">{row.pts} điểm</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <Modal open={resetOpen} onOpenChange={setResetOpen} title="Đặt lại điểm thi đua?">
        <p className="mb-4 text-sm text-forest/70">
          Xóa toàn bộ điểm và lịch sử đổi thưởng của lớp này. Danh sách học sinh, tổ và huy hiệu vẫn giữ.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="cream" onClick={() => setResetOpen(false)}>Hủy</Button>
          <Button
            variant="coral"
            onClick={() => {
              resetPoints();
              setResetOpen(false);
            }}
          >
            Xóa điểm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-leaf px-5 py-6 text-cream shadow-soft md:px-8">
      <div className="pointer-events-none absolute -right-6 -top-8 size-40 rounded-full bg-gold/30" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 size-32 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm tracking-wide text-gold">HÀNH TRÌNH CHINH PHỤC VINH QUANG</p>
          <h1 className="mt-1 max-w-xl font-display text-3xl leading-tight md:text-4xl">
            Ai sẽ là người tỏa sáng chạm tới vòng nguyệt quế?
          </h1>
          <p className="mt-2 max-w-lg text-sm text-cream/85">
            Lớp Lá 2 · Cô Nhi và Cô Trinh — dùng trên máy tính, không cần mạng.
          </p>
        </div>
        <LaurelMark />
      </div>
    </div>
  );
}

function LaurelMark() {
  return (
    <svg viewBox="0 0 140 140" className="mx-auto size-28 shrink-0 md:size-32" aria-hidden>
      <circle cx="70" cy="70" r="54" fill="#1C5C32" />
      <path d="M70 28c18 14 26 32 26 48 0-4-18-10-26-22-8 12-26 18-26 22 0-16 8-34 26-48z" fill="#E0B422" />
      <path d="M32 88c14 18 28 24 38 24 10 0 24-6 38-24-16 6-28 8-38 8s-22-2-38-8z" fill="#2F8F4E" />
      <circle cx="70" cy="62" r="10" fill="#FFF6E8" />
    </svg>
  );
}
