import * as XLSX from "xlsx";
import type { Gender, Group, Student } from "./types";

export type ParsedRow = {
  name: string;
  gender: Gender;
  groupName: string;
  notes: string;
  parentName: string;
  parentPhone: string;
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(row: Record<string, unknown>, keys: string[]): string {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    map.set(norm(String(k)), v == null ? "" : String(v).trim());
  }
  for (const key of keys) {
    const v = map.get(norm(key));
    if (v) return v;
  }
  return "";
}

function parseGender(raw: string): Gender {
  const n = norm(raw);
  if (n.includes("nu") || n.includes("gai") || n === "f" || n === "female") return "nu";
  if (n.includes("nam") || n.includes("trai") || n === "m" || n === "male") return "nam";
  return "khac";
}

export async function parseStudentFile(file: File): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0] ?? ""];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const out: ParsedRow[] = [];
  for (const row of rows) {
    const name = pick(row, ["họ tên", "ho ten", "tên", "ten", "name", "họ và tên", "hoc sinh"]);
    if (!name) continue;
    out.push({
      name,
      gender: parseGender(pick(row, ["giới tính", "gioi tinh", "gender", "phái"])),
      groupName: pick(row, ["tổ", "to", "nhóm", "nhom", "group", "to lop"]),
      notes: pick(row, ["ghi chú", "ghi chu", "notes", "note"]),
      parentName: pick(row, ["phụ huynh", "phu huynh", "tên phụ huynh", "ten phu huynh", "bố mẹ", "bo me", "parent"]),
      parentPhone: pick(row, ["sđt", "sdt", "điện thoại", "dien thoai", "phone", "số điện thoại", "so dien thoai", "liên hệ", "lien he"]),
    });
  }
  return out;
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Họ tên", "Giới tính", "Tổ", "Phụ huynh", "SĐT", "Ghi chú"],
    ["Nguyễn Bảo An", "Nam", "Tổ Hoa", "Nguyễn Văn A", "0901234567", ""],
    ["Lê Ngọc Hà", "Nữ", "Tổ Lá", "Lê Thị B", "0912345678", ""],
    ["Trần Minh Khang", "Nam", "Tổ Nắng", "Trần Văn C", "0987654321", ""],
  ]);
  ws["!cols"] = [{ wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, "HocSinh");
  XLSX.writeFile(wb, "mau-danh-sach-lop-la-2.xlsx");
}

export function exportScorebook(
  className: string,
  students: Student[],
  groups: Group[],
  points: (id: string) => number,
) {
  const gmap = new Map(groups.map((g) => [g.id, g.name]));
  const rows = [
    ["Họ tên", "Giới tính", "Tổ", "Phụ huynh", "SĐT", "Điểm", "Ghi chú"],
    ...students
      .slice()
      .sort((a, b) => points(b.id) - points(a.id) || a.name.localeCompare(b.name, "vi"))
      .map((s) => [
        s.name,
        s.gender === "nu" ? "Nữ" : s.gender === "nam" ? "Nam" : "",
        s.groupId ? (gmap.get(s.groupId) ?? "") : "",
        s.parentName ?? "",
        s.parentPhone ?? "",
        points(s.id),
        s.notes,
      ]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, "BangDiem");
  XLSX.writeFile(wb, `bang-diem-${className.replace(/\s+/g, "-")}.xlsx`);
}
