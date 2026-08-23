import { Check, Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import {
  paidFor,
  useAppStore,
  useClassFeePayments,
  useClassFees,
  useClassStudents,
} from "@/lib/store";
import { cn, formatVnd } from "@/lib/utils";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function FeesView() {
  const students = useClassStudents();
  const categories = useClassFees();
  const payments = useClassFeePayments();
  const updateFeeCategory = useAppStore((s) => s.updateFeeCategory);
  const deleteFeeCategory = useAppStore((s) => s.deleteFeeCategory);
  const setFeePaid = useAppStore((s) => s.setFeePaid);
  const setFeeAmount = useAppStore((s) => s.setFeeAmount);
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);

  const cat = categories.find((c) => c.id === activeId) ?? categories[0];
  const currentId = cat?.id ?? null;

  const stats = useMemo(() => {
    if (!cat) return { paidCount: 0, due: 0, collected: 0 };
    let paidCount = 0;
    let collected = 0;
    for (const st of students) {
      const paid = paidFor(payments, st.id, cat.id);
      collected += paid;
      if (cat.amount > 0 ? paid >= cat.amount : paid > 0) paidCount += 1;
    }
    return { paidCount, due: cat.amount * students.length, collected };
  }, [cat, students, payments]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">Các khoản thu</h1>
        <p className="text-sm text-forest/60">Theo dõi tiền đồ dùng, bảo hiểm, quỹ lớp và khoản thu khác.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={cn(
              "h-11 shrink-0 rounded-xl px-4 text-sm font-bold whitespace-nowrap",
              currentId === c.id ? "bg-leaf text-cream" : "bg-white text-forest shadow-soft",
            )}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-gold px-4 text-sm font-bold text-forest"
        >
          <Plus className="size-4" />
          Thêm khoản thu
        </button>
      </div>

      {!cat ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
          <Wallet className="mx-auto size-8 text-leaf" />
          <p className="mt-2 font-display text-xl">Chưa có khoản thu</p>
          <p className="text-sm text-forest/60">Bấm Thêm khoản thu để tạo mục mới.</p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-bold">Tên khoản thu</label>
                <input
                  className="h-11 w-full max-w-md rounded-xl bg-mist px-3 font-bold"
                  value={cat.name}
                  onChange={(e) => updateFeeCategory(cat.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Số tiền mỗi bé (đ)</label>
                <input
                  type="number"
                  min={0}
                  className="h-11 w-40 rounded-xl bg-mist px-3"
                  value={cat.amount || ""}
                  placeholder="0"
                  onChange={(e) => updateFeeCategory(cat.id, { amount: Number(e.target.value) || 0 })}
                />
              </div>
              <Button
                variant="ghost"
                className="text-coral"
                onClick={() => {
                  deleteFeeCategory(cat.id);
                  setActiveId(categories.find((c) => c.id !== cat.id)?.id ?? null);
                }}
              >
                <Trash2 className="size-4" />
                Xóa mục
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Đã nộp" value={`${stats.paidCount}/${students.length}`} />
              <Stat label="Đã thu" value={formatVnd(stats.collected)} />
              <Stat label="Dự thu" value={formatVnd(stats.due)} />
            </div>
          </section>

          <ul className="flex flex-col gap-2">
            {students
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name, "vi"))
              .map((st) => {
                const paid = paidFor(payments, st.id, cat.id);
                const done = cat.amount > 0 ? paid >= cat.amount : paid > 0;
                return (
                  <li key={st.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
                    <KidAvatar index={st.avatar} name={st.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{st.name}</p>
                      <p className="truncate text-xs text-forest/55">
                        {st.parentName || "Chưa có phụ huynh"}
                        {st.parentPhone ? ` · ${st.parentPhone}` : ""}
                      </p>
                    </div>
                    <input
                      type="number"
                      min={0}
                      className="h-11 w-28 rounded-xl bg-mist px-3 text-sm"
                      value={paid || ""}
                      placeholder="0"
                      onChange={(e) => setFeeAmount(st.id, cat.id, Number(e.target.value) || 0)}
                    />
                    <Button
                      variant={done ? "primary" : "cream"}
                      onClick={() => setFeePaid(st.id, cat.id, !done)}
                    >
                      {done ? <Check className="size-4" /> : null}
                      {done ? "Đã nộp" : "Chưa nộp"}
                    </Button>
                  </li>
                );
              })}
          </ul>
        </>
      )}

      <AddFeeModal open={addOpen} onOpenChange={setAddOpen} onCreated={setActiveId} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mist px-3 py-2">
      <p className="text-[11px] font-bold text-forest/55">{label}</p>
      <p className="font-display text-lg text-leaf-deep">{value}</p>
    </div>
  );
}

function AddFeeModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const addFeeCategory = useAppStore((s) => s.addFeeCategory);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);

  function save() {
    if (!name.trim()) return;
    addFeeCategory(name, amount);
    const cats = useAppStore.getState().feeCategories;
    const last = cats[cats.length - 1];
    if (last) onCreated(last.id);
    setName("");
    setAmount(0);
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Thêm khoản thu mới">
      <label className="mb-1 block text-xs font-bold">Tên khoản thu</label>
      <input
        className="mb-3 h-11 w-full rounded-xl bg-mist px-3"
        placeholder="Ví dụ: Tiền đồng phục"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="mb-1 block text-xs font-bold">Số tiền mỗi bé (đ)</label>
      <input
        type="number"
        min={0}
        className="mb-4 h-11 w-full rounded-xl bg-mist px-3"
        value={amount || ""}
        placeholder="0"
        onChange={(e) => setAmount(Number(e.target.value) || 0)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="cream" onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button onClick={save}>Thêm</Button>
      </div>
    </Modal>
  );
}
