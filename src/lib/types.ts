export type ViewId =
  | "home"
  | "students"
  | "groups"
  | "compete"
  | "rewards"
  | "reports"
  | "badges";

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
  notes: string;
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
  musicOn: boolean;
  view: ViewId;
};
