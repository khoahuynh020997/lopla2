import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import { studentBalance, useAppStore, useClassStudents } from "@/lib/store";
import type { Student } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

const SLICE = ["#2F8F4E", "#E0B422", "#E56B4E", "#1C5C32", "#C49212", "#5E9E8A"] as const;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const p1 = polar(cx, cy, r, start);
  const p2 = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

function labelFor(name: string, n: number) {
  const parts = name.trim().split(/\s+/);
  if (n <= 8) return name;
  if (n <= 16) return parts.slice(-2).join(" ");
  return parts.at(-1) ?? name;
}

export function LuckyWheel() {
  const students = useClassStudents();
  const addPoints = useAppStore((s) => s.addPoints);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const n = students.length;
  const arc = n > 0 ? 360 / n : 360;

  const slices = useMemo(() => {
    return students.map((st, i) => {
      const start = i * arc;
      const end = (i + 1) * arc;
      const mid = start + arc / 2;
      const fill = SLICE[i % SLICE.length]!;
      const dark = fill === "#E0B422" || fill === "#C49212";
      return { st, start, end, mid, fill, dark };
    });
  }, [students, arc]);

  function spin() {
    if (!n || spinning) return;
    const winnerIndex = Math.floor(Math.random() * n);
    const kid = students[winnerIndex]!;
    const current = ((rotation % 360) + 360) % 360;
    const desired = (360 - (winnerIndex + 0.5) * arc) % 360;
    let delta = (desired - current + 360) % 360;
    delta += (5 + Math.floor(Math.random() * 3)) * 360;
    setWinner(null);
    setSpinning(true);
    setRotation(rotation + delta);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        setWinner(kid);
        setSpinning(false);
      },
      reduced ? 80 : 4200,
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white p-4 shadow-soft md:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-gold-deep">VÒNG XOAY MAY MẮN</p>
          <h2 className="font-display text-2xl">Ai sẽ là bé may mắn?</h2>
          <p className="text-sm text-forest/60">Vòng xoay có tên tất cả các bé trong lớp.</p>
        </div>
        <Button onClick={spin} disabled={!n || spinning} variant="gold" size="lg">
          <Sparkles className="size-5" />
          {spinning ? "Đang xoay..." : "Xoay vòng"}
        </Button>
      </div>

      {n === 0 ? (
        <p className="rounded-xl bg-mist px-3 py-4 text-center text-sm text-forest/60">
          Thêm học sinh trước khi xoay vòng may mắn.
        </p>
      ) : (
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <div className="h-0 w-0 border-x-[12px] border-t-[22px] border-x-transparent border-t-gold drop-shadow-md" />
          </div>
          <div
            className="aspect-square w-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4.2s cubic-bezier(0.12, 0.72, 0.08, 1)"
                : "none",
            }}
          >
            <svg viewBox="0 0 320 320" className="size-full drop-shadow-sm" aria-hidden>
              <circle cx="160" cy="160" r="158" fill="#1C5C32" />
              {slices.map((s) => {
                const pos = polar(160, 160, n > 20 ? 108 : 118, s.mid);
                const d =
                  n === 1
                    ? undefined
                    : slicePath(160, 160, 154, s.start, s.end);
                return (
                  <g key={s.st.id}>
                    {n === 1 ? (
                      <circle cx="160" cy="160" r="154" fill={s.fill} />
                    ) : (
                      <path d={d} fill={s.fill} />
                    )}
                    <text
                      x={pos.x}
                      y={pos.y}
                      fill={s.dark ? "#1A3324" : "#FFF6E8"}
                      fontSize={n > 16 ? 9 : n > 10 ? 11 : 13}
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${s.mid}, ${pos.x}, ${pos.y})`}
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      {labelFor(s.st.name, n)}
                    </text>
                  </g>
                );
              })}
              <circle cx="160" cy="160" r="28" fill="#FFF6E8" />
              <circle cx="160" cy="160" r="22" fill="#E0B422" />
            </svg>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(winner) && !spinning}
        onOpenChange={(v) => {
          if (!v) setWinner(null);
        }}
        title="Bé may mắn"
      >
        {winner ? (
          <WinnerCard
            kid={winner}
            onAgain={() => {
              setWinner(null);
              window.setTimeout(spin, 180);
            }}
            onAward={() => {
              addPoints(winner.id, 1, "Vòng xoay may mắn");
              setWinner(null);
            }}
          />
        ) : null}
      </Modal>
    </section>
  );
}

function WinnerCard({
  kid,
  onAgain,
  onAward,
}: {
  kid: Student;
  onAgain: () => void;
  onAward: () => void;
}) {
  const pts = useAppStore((s) => studentBalance(s, kid.id));
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <div className={cn("rounded-full bg-gold/30 p-1")}>
        <KidAvatar index={kid.avatar} name={kid.name} size="lg" photoUrl={kid.photoUrl} />
      </div>
      <p className="font-display text-3xl leading-tight">{kid.name}</p>
      <p className="text-sm text-forest/60">Bé may mắn hôm nay · {pts} điểm</p>
      <div className="mt-1 grid w-full grid-cols-2 gap-2">
        <Button variant="gold" onClick={onAward}>
          +1 điểm
        </Button>
        <Button variant="cream" onClick={onAgain}>
          Xoay tiếp
        </Button>
      </div>
    </div>
  );
}
