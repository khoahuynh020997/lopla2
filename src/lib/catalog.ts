import type { BadgeDef, FeeCategory, Gender, Reward } from "./types";
import { uid } from "./utils";

export const POINT_REASONS: { label: string; delta: number }[] = [
  { label: "Ngồi ngoan", delta: 1 },
  { label: "Phát biểu tốt", delta: 1 },
  { label: "Giúp bạn", delta: 2 },
  { label: "Ăn hết suất", delta: 1 },
  { label: "Đi học đều", delta: 1 },
  { label: "Làm việc tốt", delta: 1 },
  { label: "Chia sẻ đồ chơi", delta: 2 },
  { label: "Hát / múa hay", delta: 1 },
  { label: "Nói chuyện riêng", delta: -1 },
  { label: "Không nghe lời", delta: -1 },
  { label: "Tranh đồ chơi", delta: -1 },
];

export const DEFAULT_REWARDS: Reward[] = [
  { id: "rw_star", name: "Sticker ngôi sao", cost: 3, emojiKey: "star" },
  { id: "rw_badge", name: "Huy hiệu bé ngoan", cost: 5, emojiKey: "award" },
  { id: "rw_song", name: "Chọn bài hát", cost: 6, emojiKey: "music" },
  { id: "rw_story", name: "Được kể chuyện", cost: 5, emojiKey: "book" },
  { id: "rw_seat", name: "Ngồi ghế đặc biệt", cost: 8, emojiKey: "sofa" },
  { id: "rw_lead", name: "Làm lớp trưởng 1 ngày", cost: 10, emojiKey: "crown" },
  { id: "rw_gift", name: "Quà nhỏ", cost: 7, emojiKey: "gift" },
];

export const DEFAULT_BADGES: BadgeDef[] = [
  { id: "bd_ngoan", name: "Bé ngoan", desc: "Ngoan ngoãn cả tuần", icon: "heart" },
  { id: "bd_cham", name: "Bé chăm chỉ", desc: "Cố gắng hoàn thành việc", icon: "spark" },
  { id: "bd_help", name: "Bé giúp bạn", desc: "Hay giúp đỡ bạn bè", icon: "hand" },
  { id: "bd_sang", name: "Bé sáng tạo", desc: "Ý tưởng hay, vẽ đẹp", icon: "palette" },
  { id: "bd_dung", name: "Bé dũng cảm", desc: "Dám thử, dám phát biểu", icon: "shield" },
  { id: "bd_star", name: "Ngôi sao tuần", desc: "Xuất sắc nhất tuần", icon: "star" },
  { id: "bd_an", name: "Bé ăn ngoan", desc: "Ăn hết suất, không kén", icon: "apple" },
  { id: "bd_le", name: "Bé lễ phép", desc: "Chào hỏi, biết ơn", icon: "flower" },
];

export const DEFAULT_FEE_NAMES = [
  "Tiền đồ dùng học tập",
  "Tiền Bảo Hiểm",
  "Khoản Thu Khác",
  "Quỹ Lớp",
] as const;

export function defaultFeeCategories(classId: string): FeeCategory[] {
  return DEFAULT_FEE_NAMES.map((name) => ({
    id: uid("fee"),
    classId,
    name,
    amount: 0,
  }));
}

export const GROUP_COLORS = ["leaf", "gold", "coral", "sky"] as const;

export const GENDER_LABEL: Record<Gender, string> = {
  nam: "Bé trai",
  nu: "Bé gái",
  khac: "Khác",
};

export const AVATAR_COUNT = 12;
