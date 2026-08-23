import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import { POINT_REASONS } from "@/lib/catalog";
import { studentBalance, useAppStore, useClassStudents } from "@/lib/store";
import { NamePickerButton } from "./name-picker";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function CompeteView() {
  const students = useClassStudents();
  const addPoints = useAppStore((s) => s.addPoints);
  const [pick, setPick] = useState<string | null>(null);
  const kid = students.find((s) => s.id === pick);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Thi đua</h1>
          <p className="text-sm text-forest/60">Cộng hoặc trừ điểm từng bé, chọn lý do cho rõ.</p>
        </div>
        <NamePickerButton />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {students
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "vi"))
          .map((s) => (
            <CompeteCard key={s.id} id={s.id} name={s.name} avatar={s.avatar} onOpen={() => setPick(s.id)} />
          ))}
      </div>
      {students.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-forest/60 shadow-soft">Thêm học sinh trước khi thi đua.</p>
      ) : null}

      <Modal open={Boolean(kid)} onOpenChange={(v) => !v && setPick(null)} title={kid?.name ?? "Cộng điểm"}>
        {kid ? (
          <div className="flex flex-col gap-2">
            {POINT_REASONS.map((r) => (
              <Button
                key={r.label}
                variant={r.delta > 0 ? "primary" : "coral"}
                onClick={() => {
                  addPoints(kid.id, r.delta, r.label);
                  setPick(null);
                }}
              >
                {r.delta > 0 ? "+" : ""}
                {r.delta} · {r.label}
              </Button>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function CompeteCard({
  id,
  name,
  avatar,
  onOpen,
}: {
  id: string;
  name: string;
  avatar: number;
  onOpen: () => void;
}) {
  const pts = useAppStore((s) => studentBalance(s, id));
  const addPoints = useAppStore((s) => s.addPoints);
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft">
      <button className="flex items-center gap-3 text-left" onClick={onOpen}>
        <KidAvatar index={avatar} name={name} />
        <div className="min-w-0">
          <p className="truncate font-bold">{name}</p>
          <p className="font-display text-xl tabular-nums text-leaf">{pts} điểm</p>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="coral" onClick={() => addPoints(id, -1, "Trừ điểm")}>
          <Minus className="size-4" />
          −1
        </Button>
        <Button onClick={() => addPoints(id, 1, "Cộng điểm")}>
          <Plus className="size-4" />
          +1
        </Button>
      </div>
      <Button variant="cream" onClick={onOpen}>
        Chọn lý do
      </Button>
    </article>
  );
}
