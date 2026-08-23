import { Gift, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import { studentBalance, useAppStore, useClassStudents } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function RewardsView() {
  const rewards = useAppStore((s) => s.rewards);
  const students = useClassStudents();
  const redeem = useAppStore((s) => s.redeem);
  const addReward = useAppStore((s) => s.addReward);
  const deleteReward = useAppStore((s) => s.deleteReward);
  const [pick, setPick] = useState<{ rewardId: string; name: string; cost: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [cost, setCost] = useState(5);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">Phần thưởng</h1>
        <p className="text-sm text-forest/60">Đổi điểm lấy quà. Điểm trừ ngay khi đổi thành công.</p>
      </div>
      {msg ? <p className="rounded-xl bg-mist px-3 py-2 text-sm font-bold text-leaf-deep">{msg}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => (
          <article key={r.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-xl">{r.name}</p>
                <p className="text-sm text-forest/60">{r.cost} điểm</p>
              </div>
              <Button variant="ghost" size="icon" className="text-coral" onClick={() => deleteReward(r.id)} aria-label="Xóa">
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Button
              variant="gold"
              onClick={() => setPick({ rewardId: r.id, name: r.name, cost: r.cost })}
            >
              <Gift className="size-4" />
              Đổi thưởng
            </Button>
          </article>
        ))}
      </div>

      <form
        className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          addReward(newName, cost);
          setNewName("");
        }}
      >
        <input
          className="h-11 min-w-40 flex-1 rounded-xl bg-mist px-3"
          placeholder="Tên phần thưởng mới"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="h-11 w-24 rounded-xl bg-mist px-3"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
        />
        <Button type="submit">
          <Plus className="size-4" />
          Thêm
        </Button>
      </form>

      <Modal open={Boolean(pick)} onOpenChange={(v) => !v && setPick(null)} title={`Đổi: ${pick?.name ?? ""}`}>
        <p className="mb-3 text-sm text-forest/70">Chọn bé có đủ {pick?.cost} điểm.</p>
        <ul className="flex max-h-72 flex-col gap-2 overflow-auto">
          {students.map((s) => (
            <RedeemRow
              key={s.id}
              id={s.id}
              name={s.name}
              avatar={s.avatar}
              need={pick?.cost ?? 0}
              onPick={() => {
                if (!pick) return;
                const err = redeem(s.id, pick.rewardId);
                setMsg(err ?? `${s.name} đã đổi ${pick.name}`);
                setPick(null);
              }}
            />
          ))}
        </ul>
      </Modal>
    </div>
  );
}

function RedeemRow({
  id,
  name,
  avatar,
  need,
  onPick,
}: {
  id: string;
  name: string;
  avatar: number;
  need: number;
  onPick: () => void;
}) {
  const pts = useAppStore((s) => studentBalance(s, id));
  const ok = pts >= need;
  return (
    <li className="flex items-center gap-2">
      <KidAvatar index={avatar} name={name} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{name}</span>
      <span className="text-xs tabular-nums text-forest/60">{pts} điểm</span>
      <Button size="sm" disabled={!ok} onClick={onPick}>
        Đổi
      </Button>
    </li>
  );
}
