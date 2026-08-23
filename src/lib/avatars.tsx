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
}: {
  index: number;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-9" : size === "lg" ? "size-16" : "size-12";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-soft",
        FILLS[index % FILLS.length],
        dim,
      )}
      title={name}
    >
      <Face i={index} />
    </span>
  );
}
