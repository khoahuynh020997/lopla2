import { FileSpreadsheet, Plus, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import { AVATAR_COUNT, GENDER_LABEL } from "@/lib/catalog";
import { downloadTemplate, parseStudentFile, type ParsedRow } from "@/lib/excel";
import {
  studentBalance,
  useAppStore,
  useClassGroups,
  useClassStudents,
} from "@/lib/store";
import type { Gender, Student } from "@/lib/types";
import { NamePickerButton } from "./name-picker";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function StudentsView() {
  const students = useClassStudents();
  const groups = useClassGroups();
  const deleteStudent = useAppStore((s) => s.deleteStudent);
  const [edit, setEdit] = useState<Partial<Student> | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const gmap = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Học sinh</h1>
          <p className="text-sm text-forest/60">{students.length} bé trong lớp</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NamePickerButton />
          <Button variant="outline" onClick={() => downloadTemplate()}>
            <FileSpreadsheet className="size-4" />
            Tải file mẫu
          </Button>
          <Button variant="gold" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            Mở Excel
          </Button>
          <Button onClick={() => setEdit({ name: "", gender: "khac", groupId: groups[0]?.id ?? null, avatar: students.length % AVATAR_COUNT, notes: "", parentName: "", parentPhone: "" })}>
            <Plus className="size-4" />
            Thêm bé
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
          <p className="font-display text-xl">Chưa có danh sách</p>
          <p className="mt-1 text-sm text-forest/60">Thêm từng bé hoặc mở file Excel từ máy để nhập nhanh.</p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {students
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "vi"))
            .map((s) => (
              <StudentRow
                key={s.id}
                student={s}
                groupName={s.groupId ? gmap.get(s.groupId) : undefined}
                onEdit={() => setEdit(s)}
                onDelete={() => deleteStudent(s.id)}
              />
            ))}
        </ul>
      )}

      {edit ? (
        <StudentForm
          value={edit}
          onClose={() => setEdit(null)}
        />
      ) : null}
      <ImportModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function StudentRow({
  student,
  groupName,
  onEdit,
  onDelete,
}: {
  student: Student;
  groupName?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pts = useAppStore((s) => studentBalance(s, student.id));
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
      <KidAvatar index={student.avatar} name={student.name} />
      <button className="min-w-0 flex-1 text-left" onClick={onEdit}>
        <p className="truncate font-bold">{student.name}</p>
        <p className="truncate text-xs text-forest/55">
          {GENDER_LABEL[student.gender]}
          {groupName ? ` · ${groupName}` : ""}
          {student.parentName ? ` · PH: ${student.parentName}` : ""}
        </p>
        {student.parentPhone ? (
          <a href={`tel:${student.parentPhone}`} className="text-xs font-bold text-leaf" onClick={(e) => e.stopPropagation()}>
            {student.parentPhone}
          </a>
        ) : null}
      </button>
      <span className="font-display tabular-nums text-leaf">{pts}</span>
      <Button variant="ghost" size="icon" className="text-coral" onClick={onDelete} aria-label="Xóa">
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

function StudentForm({
  value,
  onClose,
}: {
  value: Partial<Student>;
  onClose: () => void;
}) {
  const groups = useClassGroups();
  const addStudent = useAppStore((s) => s.addStudent);
  const updateStudent = useAppStore((s) => s.updateStudent);
  const [name, setName] = useState(value.name ?? "");
  const [gender, setGender] = useState<Gender>(value.gender ?? "khac");
  const [groupId, setGroupId] = useState<string | null>(value.groupId ?? null);
  const [avatar, setAvatar] = useState(value.avatar ?? 0);
  const [notes, setNotes] = useState(value.notes ?? "");
  const [parentName, setParentName] = useState(value.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(value.parentPhone ?? "");
  const isEdit = Boolean(value.id);

  function save() {
    if (!name.trim()) return;
    const payload = { name, gender, groupId, avatar, notes, parentName, parentPhone };
    if (value.id) updateStudent(value.id, payload);
    else addStudent(payload);
    onClose();
  }

  return (
    <Modal open onOpenChange={(v) => !v && onClose()} title={isEdit ? "Sửa học sinh" : "Thêm học sinh"}>
      <label className="mb-1 block text-xs font-bold">Họ tên</label>
      <input className="mb-3 h-11 w-full rounded-xl bg-mist px-3" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="mb-1 block text-xs font-bold">Giới tính</label>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {(["nam", "nu", "khac"] as const).map((g) => (
          <Button key={g} type="button" variant={gender === g ? "primary" : "cream"} onClick={() => setGender(g)}>
            {GENDER_LABEL[g]}
          </Button>
        ))}
      </div>
      <label className="mb-1 block text-xs font-bold">Tổ</label>
      <select
        className="mb-3 h-11 w-full rounded-xl bg-mist px-3"
        value={groupId ?? ""}
        onChange={(e) => setGroupId(e.target.value || null)}
      >
        <option value="">Chưa chia tổ</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
      <label className="mb-1 block text-xs font-bold">Tên phụ huynh</label>
      <input className="mb-3 h-11 w-full rounded-xl bg-mist px-3" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Họ tên bố / mẹ" />
      <label className="mb-1 block text-xs font-bold">Số điện thoại liên hệ</label>
      <input className="mb-3 h-11 w-full rounded-xl bg-mist px-3" type="tel" inputMode="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="090..." />
      <label className="mb-1 block text-xs font-bold">Ảnh đại diện</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {Array.from({ length: AVATAR_COUNT }, (_, i) => (
          <button key={i} type="button" onClick={() => setAvatar(i)} className={avatar === i ? "ring-2 ring-leaf rounded-full" : ""}>
            <KidAvatar index={i} name={`avatar ${i}`} size="sm" />
          </button>
        ))}
      </div>
      <label className="mb-1 block text-xs font-bold">Ghi chú</label>
      <input className="mb-4 h-11 w-full rounded-xl bg-mist px-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Button variant="cream" onClick={onClose}>Hủy</Button>
        <Button onClick={save}>Lưu</Button>
      </div>
    </Modal>
  );
}

function ImportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const importStudents = useAppStore((s) => s.importStudents);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [err, setErr] = useState("");
  const [added, setAdded] = useState<number | null>(null);

  async function onFile(file: File | undefined) {
    setErr("");
    setAdded(null);
    if (!file) return;
    try {
      const parsed = await parseStudentFile(file);
      if (!parsed.length) setErr("Không đọc được cột Họ tên. Dùng file mẫu rồi điền tên bé.");
      setRows(parsed);
    } catch {
      setErr("Không mở được file. Chọn .xlsx, .xls hoặc .csv.");
    }
  }

  function confirm() {
    for (const r of rows) {
      if (!r.groupName.trim()) continue;
      const st = useAppStore.getState();
      const exists = st.groups.some(
        (g) =>
          g.classId === st.activeClassId &&
          g.name.trim().toLowerCase() === r.groupName.trim().toLowerCase(),
      );
      if (!exists) st.addGroup(r.groupName);
    }
    const latest = useAppStore.getState();
    const g2 = new Map(
      latest.groups
        .filter((g) => g.classId === latest.activeClassId)
        .map((g) => [g.name.trim().toLowerCase(), g.id]),
    );
    const final = rows.map((r, i) => ({
      name: r.name,
      gender: r.gender,
      groupId: r.groupName ? g2.get(r.groupName.trim().toLowerCase()) ?? null : null,
      avatar: i % AVATAR_COUNT,
      notes: r.notes,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
    }));
    const n = importStudents(final);
    setAdded(n);
    setRows([]);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Nhập học sinh từ Excel" wide>
      <p className="mb-3 text-sm text-forest/70">
        Chọn file Excel trên máy. Cột bắt buộc: <b>Họ tên</b>. Thêm được Giới tính, Tổ, Phụ huynh, SĐT, Ghi chú. Tên trùng sẽ bỏ qua.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => downloadTemplate()}>
          <FileSpreadsheet className="size-4" />
          Tải file mẫu
        </Button>
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-leaf px-4 text-sm font-semibold text-cream">
          <Upload className="size-4" />
          Chọn file
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {err ? <p className="mb-2 text-sm text-coral">{err}</p> : null}
      {added != null ? <p className="mb-2 text-sm text-leaf-deep">Đã thêm {added} học sinh.</p> : null}
      {rows.length ? (
        <>
          <p className="mb-2 text-xs font-bold">{rows.length} dòng sẽ nhập</p>
          <div className="mb-3 max-h-48 overflow-auto rounded-xl bg-mist p-2 text-sm">
            {rows.slice(0, 40).map((r, i) => (
              <p key={i}>{r.name}{r.parentName ? ` · ${r.parentName}` : ""}{r.groupName ? ` · ${r.groupName}` : ""}</p>
            ))}
            {rows.length > 40 ? <p>…</p> : null}
          </div>
          <Button className="w-full" onClick={confirm}>Xác nhận nhập</Button>
        </>
      ) : null}
    </Modal>
  );
}
