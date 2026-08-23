import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BADGES, DEFAULT_REWARDS } from "./catalog";
import type {
  AppData,
  ClassRoom,
  Gender,
  Group,
  Student,
  ViewId,
} from "./types";
import { uid } from "./utils";

const YEAR = "2026-2027";

function seed(): AppData {
  const classId = "class_la2";
  const g1 = uid("g");
  const g2 = uid("g");
  const g3 = uid("g");
  const g4 = uid("g");
  const groups: Group[] = [
    { id: g1, classId, name: "Tổ Hoa", color: "coral" },
    { id: g2, classId, name: "Tổ Lá", color: "leaf" },
    { id: g3, classId, name: "Tổ Nắng", color: "gold" },
    { id: g4, classId, name: "Tổ Mây", color: "sky" },
  ];
  const names: { name: string; gender: Gender; g: number; av: number }[] = [
    { name: "Nguyễn Bảo An", gender: "nam", g: 0, av: 0 },
    { name: "Trần Minh Khang", gender: "nam", g: 1, av: 1 },
    { name: "Lê Ngọc Hà", gender: "nu", g: 2, av: 2 },
    { name: "Phạm Gia Hưng", gender: "nam", g: 3, av: 3 },
    { name: "Hoàng Khánh Linh", gender: "nu", g: 0, av: 4 },
    { name: "Vũ Thiên An", gender: "nu", g: 1, av: 5 },
    { name: "Đặng Mỹ Anh", gender: "nu", g: 2, av: 6 },
    { name: "Bùi Quốc Bảo", gender: "nam", g: 3, av: 7 },
    { name: "Ngô Gia Hân", gender: "nu", g: 0, av: 8 },
    { name: "Đỗ Minh Đức", gender: "nam", g: 1, av: 9 },
  ];
  const students: Student[] = names.map((n) => ({
    id: uid("st"),
    classId,
    name: n.name,
    gender: n.gender,
    groupId: groups[n.g]!.id,
    avatar: n.av,
    notes: "",
  }));
  const now = Date.now();
  return {
    classes: [
      {
        id: classId,
        name: "Lớp Lá 2",
        teachers: "Cô Nhi và Cô Trinh",
        year: YEAR,
      },
    ],
    activeClassId: classId,
    students,
    groups,
    events: [
      { id: uid("ev"), classId, studentId: students[0]!.id, delta: 3, reason: "Giúp bạn", at: now - 86400000 },
      { id: uid("ev"), classId, studentId: students[2]!.id, delta: 2, reason: "Phát biểu tốt", at: now - 3600000 },
      { id: uid("ev"), classId, studentId: students[4]!.id, delta: 4, reason: "Ngồi ngoan", at: now - 7200000 },
      { id: uid("ev"), classId, studentId: students[1]!.id, delta: 1, reason: "Làm việc tốt", at: now - 1800000 },
    ],
    rewards: DEFAULT_REWARDS,
    redemptions: [],
    badges: DEFAULT_BADGES,
    awarded: [],
    musicOn: false,
    view: "home",
  };
}

type Actions = {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setView: (v: ViewId) => void;
  setMusic: (on: boolean) => void;
  setActiveClass: (id: string) => void;
  addClass: (name: string, teachers: string) => void;
  renameClass: (id: string, name: string, teachers: string) => void;
  deleteClass: (id: string) => void;
  addGroup: (name: string) => void;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  addStudent: (s: Omit<Student, "id" | "classId">) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (rows: Omit<Student, "id" | "classId">[]) => number;
  addPoints: (studentId: string, delta: number, reason: string) => void;
  resetPoints: () => void;
  redeem: (studentId: string, rewardId: string) => string | null;
  addReward: (name: string, cost: number) => void;
  deleteReward: (id: string) => void;
  awardBadge: (studentId: string, badgeId: string) => void;
  revokeBadge: (id: string) => void;
  replaceAll: (data: AppData) => void;
};

export const useAppStore = create<AppData & Actions>()(
  persist(
    (set, get) => ({
      ...seed(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setView: (view) => set({ view }),
      setMusic: (musicOn) => set({ musicOn }),
      setActiveClass: (activeClassId) => set({ activeClassId, view: "home" }),
      addClass: (name, teachers) => {
        const room: ClassRoom = {
          id: uid("class"),
          name: name.trim() || "Lớp mới",
          teachers: teachers.trim() || "Cô Nhi và Cô Trinh",
          year: YEAR,
        };
        set({ classes: [...get().classes, room], activeClassId: room.id });
      },
      renameClass: (id, name, teachers) =>
        set({
          classes: get().classes.map((c) =>
            c.id === id ? { ...c, name: name.trim(), teachers: teachers.trim() } : c,
          ),
        }),
      deleteClass: (id) => {
        const { classes, activeClassId } = get();
        if (classes.length <= 1) return;
        const next = classes.filter((c) => c.id !== id);
        set({
          classes: next,
          activeClassId: activeClassId === id ? next[0]!.id : activeClassId,
          students: get().students.filter((s) => s.classId !== id),
          groups: get().groups.filter((g) => g.classId !== id),
          events: get().events.filter((e) => e.classId !== id),
          redemptions: get().redemptions.filter((r) => r.classId !== id),
          awarded: get().awarded.filter((a) => a.classId !== id),
        });
      },
      addGroup: (name) => {
        const classId = get().activeClassId;
        const used = get().groups.filter((g) => g.classId === classId).length;
        const colors = ["leaf", "gold", "coral", "sky"] as const;
        set({
          groups: [
            ...get().groups,
            {
              id: uid("g"),
              classId,
              name: name.trim() || `Tổ ${used + 1}`,
              color: colors[used % 4]!,
            },
          ],
        });
      },
      renameGroup: (id, name) =>
        set({
          groups: get().groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)),
        }),
      deleteGroup: (id) =>
        set({
          groups: get().groups.filter((g) => g.id !== id),
          students: get().students.map((s) =>
            s.groupId === id ? { ...s, groupId: null } : s,
          ),
        }),
      addStudent: (s) => {
        const classId = get().activeClassId;
        set({
          students: [
            ...get().students,
            { ...s, id: uid("st"), classId, name: s.name.trim() },
          ],
        });
      },
      updateStudent: (id, patch) =>
        set({
          students: get().students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
      deleteStudent: (id) =>
        set({
          students: get().students.filter((s) => s.id !== id),
          events: get().events.filter((e) => e.studentId !== id),
          redemptions: get().redemptions.filter((r) => r.studentId !== id),
          awarded: get().awarded.filter((a) => a.studentId !== id),
        }),
      importStudents: (rows) => {
        const classId = get().activeClassId;
        const existing = new Set(
          get()
            .students.filter((s) => s.classId === classId)
            .map((s) => s.name.trim().toLowerCase()),
        );
        const fresh: Student[] = [];
        for (const row of rows) {
          const name = row.name.trim();
          if (!name) continue;
          if (existing.has(name.toLowerCase())) continue;
          existing.add(name.toLowerCase());
          fresh.push({ ...row, id: uid("st"), classId, name });
        }
        if (fresh.length) set({ students: [...get().students, ...fresh] });
        return fresh.length;
      },
      addPoints: (studentId, delta, reason) => {
        if (!delta) return;
        set({
          events: [
            {
              id: uid("ev"),
              classId: get().activeClassId,
              studentId,
              delta,
              reason,
              at: Date.now(),
            },
            ...get().events,
          ],
        });
      },
      resetPoints: () => {
        const classId = get().activeClassId;
        set({
          events: get().events.filter((e) => e.classId !== classId),
          redemptions: get().redemptions.filter((r) => r.classId !== classId),
        });
      },
      redeem: (studentId, rewardId) => {
        const reward = get().rewards.find((r) => r.id === rewardId);
        if (!reward) return "Không tìm thấy phần thưởng";
        const pts = studentBalance(get(), studentId);
        if (pts < reward.cost) return "Bé chưa đủ điểm để đổi";
        set({
          redemptions: [
            {
              id: uid("rd"),
              classId: get().activeClassId,
              studentId,
              rewardId,
              cost: reward.cost,
              at: Date.now(),
            },
            ...get().redemptions,
          ],
        });
        return null;
      },
      addReward: (name, cost) =>
        set({
          rewards: [
            ...get().rewards,
            {
              id: uid("rw"),
              name: name.trim(),
              cost: Math.max(1, cost),
              emojiKey: "gift",
            },
          ],
        }),
      deleteReward: (id) =>
        set({ rewards: get().rewards.filter((r) => r.id !== id) }),
      awardBadge: (studentId, badgeId) => {
        const classId = get().activeClassId;
        const dup = get().awarded.some(
          (a) => a.classId === classId && a.studentId === studentId && a.badgeId === badgeId,
        );
        if (dup) return;
        set({
          awarded: [
            ...get().awarded,
            { id: uid("ab"), classId, studentId, badgeId, at: Date.now() },
          ],
        });
      },
      revokeBadge: (id) =>
        set({ awarded: get().awarded.filter((a) => a.id !== id) }),
      replaceAll: (data) => set({ ...data, hydrated: true }),
    }),
    {
      name: "lop-la-2-v1",
      skipHydration: true,
      partialize: (s) => ({
        classes: s.classes,
        activeClassId: s.activeClassId,
        students: s.students,
        groups: s.groups,
        events: s.events,
        rewards: s.rewards,
        redemptions: s.redemptions,
        badges: s.badges,
        awarded: s.awarded,
        musicOn: false,
        view: s.view,
      }),
    },
  ),
);

export function studentEarned(state: AppData, studentId: string): number {
  return state.events
    .filter((e) => e.studentId === studentId)
    .reduce((n, e) => n + e.delta, 0);
}

export function studentSpent(state: AppData, studentId: string): number {
  return state.redemptions
    .filter((r) => r.studentId === studentId)
    .reduce((n, r) => n + r.cost, 0);
}

export function studentBalance(state: AppData, studentId: string): number {
  return studentEarned(state, studentId) - studentSpent(state, studentId);
}

export function classStudents(state: AppData): Student[] {
  return state.students.filter((s) => s.classId === state.activeClassId);
}

export function classGroups(state: AppData): Group[] {
  return state.groups.filter((g) => g.classId === state.activeClassId);
}

export function activeClass(state: AppData): ClassRoom | undefined {
  return state.classes.find((c) => c.id === state.activeClassId);
}

export function useActiveClass() {
  return useAppStore((s) => s.classes.find((c) => c.id === s.activeClassId));
}

export function useClassStudents() {
  const id = useAppStore((s) => s.activeClassId);
  const students = useAppStore((s) => s.students);
  return useMemo(() => students.filter((s) => s.classId === id), [students, id]);
}

export function useClassGroups() {
  const id = useAppStore((s) => s.activeClassId);
  const groups = useAppStore((s) => s.groups);
  return useMemo(() => groups.filter((g) => g.classId === id), [groups, id]);
}

export function useClassEvents() {
  const id = useAppStore((s) => s.activeClassId);
  const events = useAppStore((s) => s.events);
  return useMemo(() => events.filter((e) => e.classId === id), [events, id]);
}

export function useClassRedemptions() {
  const id = useAppStore((s) => s.activeClassId);
  const redemptions = useAppStore((s) => s.redemptions);
  return useMemo(() => redemptions.filter((r) => r.classId === id), [redemptions, id]);
}

export function useClassAwarded() {
  const id = useAppStore((s) => s.activeClassId);
  const awarded = useAppStore((s) => s.awarded);
  return useMemo(() => awarded.filter((a) => a.classId === id), [awarded, id]);
}
