import { Download, FileSpreadsheet } from "lucide-react";
import { useMemo } from "react";
import { KidAvatar } from "@/lib/avatars";
import { exportScorebook } from "@/lib/excel";
import {
  studentBalance,
  useActiveClass,
  useAppStore,
  useClassEvents,
  useClassGroups,
  useClassRedemptions,
  useClassStudents,
} from "@/lib/store";
import { Button } from "./ui/button";

export function ReportsView() {
  const room = useActiveClass();
  const students = useClassStudents();
  const groups = useClassGroups();
  const events = useClassEvents();
  const redemptions = useClassRedemptions();
  const rewards = useAppStore((s) => s.rewards);

  const ranked = useMemo(() => {
    const earned = (id: string) => events.filter((e) => e.studentId === id).reduce((n, e) => n + e.delta, 0);
    const spent = (id: string) => redemptions.filter((r) => r.studentId === id).reduce((n, r) => n + r.cost, 0);
    return students
      .map((st) => ({
        st,
        earned: earned(st.id),
        spent: spent(st.id),
        pts: earned(st.id) - spent(st.id),
      }))
      .sort((a, b) => b.pts - a.pts || a.st.name.localeCompare(b.st.name, "vi"));
  }, [students, events, redemptions]);

  const groupRows = groups.map((g) => {
    const members = students.filter((s) => s.groupId === g.id);
    const pts = ranked.filter((r) => r.st.groupId === g.id).reduce((n, r) => n + r.pts, 0);
    return { g, members: members.length, pts };
  }).sort((a, b) => b.pts - a.pts);

  function backup() {
    const data = useAppStore.getState();
    const blob = new Blob(
      [JSON.stringify({
        classes: data.classes,
        activeClassId: data.activeClassId,
        students: data.students,
        groups: data.groups,
        events: data.events,
        rewards: data.rewards,
        redemptions: data.redemptions,
        badges: data.badges,
        awarded: data.awarded,
        feeCategories: data.feeCategories,
        feePayments: data.feePayments,
      }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lop-la-2-sao-luu.json";
    a.click();
  }

  function restore(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Record<string, unknown>;
        if (!Array.isArray(parsed.students) || !Array.isArray(parsed.classes)) return;
        useAppStore.getState().replaceAll({
          ...useAppStore.getState(),
          classes: parsed.classes as never,
          activeClassId: String(parsed.activeClassId ?? useAppStore.getState().activeClassId),
          students: parsed.students as never,
          groups: (parsed.groups as never) ?? [],
          events: (parsed.events as never) ?? [],
          rewards: (parsed.rewards as never) ?? useAppStore.getState().rewards,
          redemptions: (parsed.redemptions as never) ?? [],
          badges: (parsed.badges as never) ?? useAppStore.getState().badges,
          awarded: (parsed.awarded as never) ?? [],
          feeCategories: (parsed.feeCategories as never) ?? useAppStore.getState().feeCategories,
          feePayments: (parsed.feePayments as never) ?? [],
          musicOn: false,
          view: "reports",
        });
      } catch {
        /* ignore bad file */
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Báo cáo</h1>
          <p className="text-sm text-forest/60">Bảng điểm, tổ, lịch sử — xuất Excel hoặc sao lưu máy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="gold"
            onClick={() =>
              exportScorebook(room?.name ?? "lop", students, groups, (id) =>
                studentBalance(useAppStore.getState(), id),
              )
            }
          >
            <FileSpreadsheet className="size-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={backup}>
            <Download className="size-4" />
            Sao lưu JSON
          </Button>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-xl bg-mist px-4 text-sm font-semibold">
            Khôi phục
            <input type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restore(f);
            }} />
          </label>
        </div>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-mist text-xs font-bold uppercase tracking-wide text-forest/70">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Học sinh</th>
              <th className="px-3 py-3">Tích lũy</th>
              <th className="px-3 py-3">Đã đổi</th>
              <th className="px-3 py-3">Còn lại</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row, i) => (
              <tr key={row.st.id} className="border-t border-forest/8">
                <td className="px-3 py-2 tabular-nums">{i + 1}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2">
                    <KidAvatar index={row.st.avatar} name={row.st.name} size="sm" />
                    {row.st.name}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums">{row.earned}</td>
                <td className="px-3 py-2 tabular-nums">{row.spent}</td>
                <td className="px-3 py-2 font-display text-lg tabular-nums text-leaf">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-display text-xl">Điểm theo tổ</h2>
        <ul className="flex flex-col gap-2">
          {groupRows.map((row) => (
            <li key={row.g.id} className="flex items-center justify-between rounded-xl bg-mist px-3 py-2">
              <span className="font-bold">{row.g.name} · {row.members} bé</span>
              <span className="font-display tabular-nums text-leaf">{row.pts}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-display text-xl">Lịch sử gần đây</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {events.slice(0, 20).map((e) => {
            const st = students.find((s) => s.id === e.studentId);
            return (
              <li key={e.id} className="flex justify-between gap-2 border-b border-forest/6 py-1">
                <span>
                  <b>{st?.name ?? "Bé"}</b> · {e.reason}
                </span>
                <span className={`tabular-nums font-bold ${e.delta >= 0 ? "text-leaf" : "text-coral"}`}>
                  {e.delta > 0 ? "+" : ""}
                  {e.delta}
                </span>
              </li>
            );
          })}
          {redemptions.slice(0, 8).map((r) => {
            const st = students.find((s) => s.id === r.studentId);
            const rw = rewards.find((x) => x.id === r.rewardId);
            return (
              <li key={r.id} className="flex justify-between gap-2 py-1 text-forest/70">
                <span>{st?.name} đổi {rw?.name}</span>
                <span className="tabular-nums">−{r.cost}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
