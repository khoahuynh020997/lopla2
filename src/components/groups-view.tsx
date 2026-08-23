import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import {
  studentBalance,
  useAppStore,
  useClassGroups,
  useClassStudents,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const TONE: Record<string, string> = {
  leaf: "bg-leaf text-cream",
  gold: "bg-gold text-forest",
  coral: "bg-coral text-cream",
  sky: "bg-sky text-cream",
};

export function GroupsView() {
  const groups = useClassGroups();
  const students = useClassStudents();
  const addGroup = useAppStore((s) => s.addGroup);
  const renameGroup = useAppStore((s) => s.renameGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const addPoints = useAppStore((s) => s.addPoints);
  const [name, setName] = useState("");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">Nhóm / Tổ</h1>
        <p className="text-sm text-forest/60">Chia tổ và cộng điểm cả tổ cùng lúc.</p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addGroup(name);
          setName("");
        }}
      >
        <input
          className="h-11 min-w-48 flex-1 rounded-xl bg-white px-3 shadow-border"
          placeholder="Tên tổ mới, ví dụ Tổ Hoa"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">
          <Plus className="size-4" />
          Thêm tổ
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => {
          const members = students.filter((s) => s.groupId === g.id);
          return (
            <GroupCard
              key={g.id}
              name={g.name}
              color={g.color}
              members={members}
              onRename={(n) => renameGroup(g.id, n)}
              onDelete={() => deleteGroup(g.id)}
              onPlusAll={() => members.forEach((s) => addPoints(s.id, 1, `Tổ ${g.name} thi đua`))}
            />
          );
        })}
      </div>
      {groups.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-forest/60 shadow-soft">Chưa có tổ. Thêm tổ rồi gán bé trong mục Học sinh.</p>
      ) : null}
    </div>
  );
}

function GroupCard({
  name,
  color,
  members,
  onRename,
  onDelete,
  onPlusAll,
}: {
  name: string;
  color: string;
  members: { id: string; name: string; avatar: number }[];
  onRename: (n: string) => void;
  onDelete: () => void;
  onPlusAll: () => void;
}) {
  const total = useAppStore((s) =>
    members.reduce((n, m) => n + studentBalance(s, m.id), 0),
  );
  return (
    <section className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("rounded-lg px-2 py-1 text-xs font-bold", TONE[color] ?? TONE.leaf)}>{name}</span>
        <input
          className="h-10 min-w-0 flex-1 rounded-xl bg-mist px-2 text-sm font-bold"
          defaultValue={name}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== name) onRename(e.target.value);
          }}
        />
        <Button variant="ghost" size="icon" className="text-coral" onClick={onDelete} aria-label="Xóa tổ">
          <Trash2 className="size-4" />
        </Button>
      </div>
      <p className="mb-2 font-display text-2xl tabular-nums text-leaf">{total} điểm</p>
      <Button className="mb-3 w-full" variant="gold" onClick={onPlusAll} disabled={!members.length}>
        +1 cho cả tổ
      </Button>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2">
            <KidAvatar index={m.avatar} name={m.name} size="sm" />
            <span className="truncate text-sm font-bold">{m.name}</span>
          </li>
        ))}
        {members.length === 0 ? <li className="text-sm text-forest/50">Chưa có bé</li> : null}
      </ul>
    </section>
  );
}
