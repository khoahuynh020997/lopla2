import { cn } from "./utils";

const FILLS = [
  "bg-leaf",
  "bg-gold",
  "bg-coral",
  "bg-leaf-deep",
  "bg-gold-deep",
  "bg-leaf",
  "bg-coral",
  "bg-gold",
  "bg-leaf-deep",
  "bg-coral",
  "bg-gold-deep",
  "bg-leaf",
];

function Face({ i }: { i: number }) {
  const eyes = (
    <>
      <circle cx="13" cy="14" r="1.6" fill="#1A3324" />
      <circle cx="23" cy="14" r="1.6" fill="#1A3324" />
    </>
  );
  const smile = <path d="M13 21c2.4 3 7.6 3 10 0" stroke="#1A3324" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
  switch (i % 12) {
    case 1:
      return (
        <svg viewBox="0 0 36 36" className="size-full">
          <ellipse cx="18" cy="20" rx="11" ry="10" fill="#fff6e8" />
          <ellipse cx="8" cy="16" rx="4" ry="5" fill="#fff6e8" />
          <ellipse cx="28" cy="16" rx="4" ry="5" fill="#fff6e8" />
          {eyes}
          {smile}
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 36 36" className="size-full">
          <circle cx="18" cy="20" r="10" fill="#fff6e8" />
          <circle cx="11" cy="10" r="3.2" fill="#fff6e8" />
          <circle cx="25" cy="10" r="3.2" fill="#fff6e8" />
          {eyes}
          {smile}
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 36 36" className="size-full">
          <rect x="8" y="11" width="20" height="16" rx="8" fill="#fff6e8" />
          <circle cx="18" cy="9" r="3" fill="#fff6e8" />
          {eyes}
          {smile}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 36 36" className="size-full">
          <circle cx="18" cy="19" r="10" fill="#fff6e8" />
          {eyes}
          {smile}
        </svg>
      );
  }
}

export function KidAvatar({
  index,
  name,
  size = "md",
  photoUrl,
}: {
  index: number;
  name: string;
  size?: "sm" | "md" | "lg";
  photoUrl?: string | null;
}) {
  const dim = size === "sm" ? "size-9" : size === "lg" ? "size-16" : "size-12";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-soft",
        photoUrl ? "bg-mist" : FILLS[index % FILLS.length],
        dim,
      )}
      title={name}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="size-full object-cover" />
      ) : (
        <Face i={index} />
      )}
    </span>
  );
}

/** Square-crop and compress a kid photo so it fits in localStorage. */
export function readKidPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Chỉ nhận file ảnh."));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const size = 192;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không vẽ được ảnh."));
          return;
        }
        const s = Math.min(img.width, img.height) || 1;
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.fillStyle = "#fff6e8";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không mở được ảnh."));
    };
    img.src = url;
  });
}
