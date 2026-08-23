import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useActiveClass, useAppStore } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function ClassSwitcher() {
  const [open, setOpen] = useState(false);
  const room = useActiveClass();
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Lớp: {room?.name ?? "—"}
        <ChevronDown className="size-4" />
      </Button>
      <ClassModal open={open} onOpenChange={setOpen} />
    </>
  );
}

function ClassModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const classes = useAppStore((s) => s.classes);
  const activeId = useAppStore((s) => s.activeClassId);
  const students = useAppStore((s) => s.students);
  const setActiveClass = useAppStore((s) => s.setActiveClass);
  const addClass = useAppStore((s) => s.addClass);
  const renameClass = useAppStore((s) => s.renameClass);
  const deleteClass = useAppStore((s) => s.deleteClass);
  const [name, setName] = useState("");
  const [teachers, setTeachers] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTeachers, setEditTeachers] = useState("");

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Chọn lớp">
      <div className="mb-4 rounded-xl bg-mist p-3">
        <p className="mb-2 text-xs font-bold text-leaf-deep">Tạo lớp mới</p>
        <input
          className="mb-2 h-11 w-full rounded-xl bg-white px-3 shadow-border"
          placeholder="Tên lớp, ví dụ Lớp Lá 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="mb-2 h-11 w-full rounded-xl bg-white px-3 shadow-border"
          placeholder="Giáo viên, ví dụ Cô Lan"
          value={teachers}
          onChange={(e) => setTeachers(e.target.value)}
        />
        <Button
          className="w-full"
          variant="gold"
          onClick={() => {
            if (!name.trim()) return;
            addClass(name, teachers);
            setName("");
            setTeachers("");
            onOpenChange(false);
          }}
        >
          <Plus className="size-4" />
          Tạo lớp mới
        </Button>
      </div>
      <p className="mb-2 text-xs font-bold text-forest/60">Chọn lớp đang dùng</p>
      <ul className="flex flex-col gap-2">
        {classes.map((c) => {
          const n = students.filter((s) => s.classId === c.id).length;
          const isEdit = editing === c.id;
          return (
            <li key={c.id} className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-border">
              {isEdit ? (
                <div className="flex flex-col gap-2">
                  <input
                    className="h-11 w-full rounded-xl bg-mist px-3"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tên lớp"
                  />
                  <input
                    className="h-11 w-full rounded-xl bg-mist px-3"
                    value={editTeachers}
                    onChange={(e) => setEditTeachers(e.target.value)}
                    placeholder="Tên cô, ví dụ Cô Lan"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="cream" size="sm" onClick={() => setEditing(null)}>Hủy</Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!editName.trim()) return;
                        renameClass(c.id, editName, editTeachers);
                        setEditing(null);
                      }}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveClass(c.id);
                      onOpenChange(false);
                    }}
                    className={`min-h-14 flex-1 rounded-xl px-3 py-2 text-left ${
                      c.id === activeId ? "bg-leaf text-cream" : "hover:bg-mist"
                    }`}
                  >
                    <p className="font-bold">{c.name}</p>
                    <p className={`text-xs ${c.id === activeId ? "text-cream/80" : "text-forest/55"}`}>
                      {c.teachers} · {n} học sinh
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sửa tên lớp và cô"
                    onClick={() => {
                      setEditing(c.id);
                      setEditName(c.name);
                      setEditTeachers(c.teachers);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {classes.length > 1 ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-coral"
                      onClick={() => deleteClass(c.id)}
                      aria-label="Xóa lớp"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
