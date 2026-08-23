export type ViewId =
  | "home"
  | "students"
  | "groups"
  | "compete"
  | "rewards"
  | "reports"
  | "badges"
  | "fees";

export type Gender = "nam" | "nu" | "khac";

export type ClassRoom = {
  id: string;
  name: string;
  teachers: string;
  year: string;
};

export type Student = {
  id: string;
  classId: string;
  name: string;
  gender: Gender;
  groupId: string | null;
  avatar: number;
  photoUrl: string;
  notes: string;
  parentName: string;
  parentPhone: string;
};

export type Group = {
  id: string;
  classId: string;
  name: string;
  color: "leaf" | "gold" | "coral" | "sky";
};

export type PointEvent = {
  id: string;
  classId: string;
  studentId: string;
  delta: number;
  reason: string;
  at: number;
};

export type Reward = {
  id: string;
  name: string;
  cost: number;
  emojiKey: string;
};

export type Redemption = {
  id: string;
  classId: string;
  studentId: string;
  rewardId: string;
  cost: number;
  at: number;
};

export type BadgeDef = {
  id: string;
  name: string;
  desc: string;
  icon: string;
};

export type StudentBadge = {
  id: string;
  classId: string;
  studentId: string;
  badgeId: string;
  at: number;
};

export type FeeCategory = {
  id: string;
  classId: string;
  name: string;
  amount: number;
};

export type FeePayment = {
  id: string;
  classId: string;
  studentId: string;
  categoryId: string;
  amount: number;
  at: number;
};

export type AppData = {
  classes: ClassRoom[];
  activeClassId: string;
  students: Student[];
  groups: Group[];
  events: PointEvent[];
  rewards: Reward[];
  redemptions: Redemption[];
  badges: BadgeDef[];
  awarded: StudentBadge[];
  feeCategories: FeeCategory[];
  feePayments: FeePayment[];
  musicOn: boolean;
  view: ViewId;
};
