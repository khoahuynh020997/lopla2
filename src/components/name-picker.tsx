import { Dices } from "lucide-react";
import { useMemo, useState } from "react";
import { KidAvatar } from "@/lib/avatars";
import { studentBalance, useAppStore, useClassStudents } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

export function NamePickerButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} variant="gold" onClick={() => setOpen(true)}>
        <Dices className="size-4" />
        Gọi tên
      </Button>
      <NamePickerModal open={open} onOpenChange={setOpen} />
    </>
  );
}

function NamePickerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const students = useClassStudents();
  const addPoints = useAppStore((s) => s.addPoints);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const kid = students.find((s) => s.id === picked);
  const kidId = kid?.id;
  const pts = useAppStore((s) => (kidId ? studentBalance(s, kidId) : 0));

  const label = useMemo(() => {
    if (spinning) return "Đang gọi tên...";
    if (kid) return kid.name;
    return "Bấm để gọi một bé";
  }, [spinning, kid]);

  function spin() {
    if (!students.length || spinning) return;
    setSpinning(true);
    setPicked(null);
    let i = 0;
    const t = setInterval(() => {
      const s = students[i % students.length]!;
      setPicked(s.id);
      i += 1;
    }, 80);
    setTimeout(() => {
      clearInterval(t);
      const win = students[Math.floor(Math.random() * students.length)]!;
      setPicked(win.id);
      setSpinning(false);
    }, 1400);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Gọi tên học sinh">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {kid ? <KidAvatar index={kid.avatar} name={kid.name} size="lg" /> : (
          <div className="flex size-16 items-center justify-center rounded-full bg-mist font-display text-2xl text-leaf">?</div>
        )}
        <p className="font-display text-2xl">{label}</p>
        {kid && !spinning ? <p className="text-sm text-forest/60">{pts} điểm vòng nguyệt quế</p> : null}
        <div className="flex w-full flex-col gap-2">
          <Button onClick={spin} disabled={!students.length || spinning} size="lg">
            <Dices className="size-5" />
            {spinning ? "Đang quay..." : "Gọi ngẫu nhiên"}
          </Button>
          {kid && !spinning ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="gold" onClick={() => addPoints(kid.id, 1, "Phát biểu tốt")}>
                +1 Phát biểu
              </Button>
              <Button variant="cream" onClick={() => addPoints(kid.id, 1, "Ngồi ngoan")}>
                +1 Ngồi ngoan
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
