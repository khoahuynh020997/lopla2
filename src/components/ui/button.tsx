import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary: "bg-leaf text-cream shadow-soft hover:bg-leaf-deep",
        gold: "bg-gold text-forest shadow-soft hover:bg-gold-deep",
        coral: "bg-coral text-cream shadow-soft hover:opacity-90",
        cream: "bg-cream text-forest shadow-soft hover:bg-mist",
        ghost: "bg-transparent text-forest hover:bg-mist",
        outline: "bg-white text-forest shadow-border hover:bg-mist",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
