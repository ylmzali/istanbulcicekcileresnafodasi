import { cn } from "@/lib/utils";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary-800)] text-white hover:bg-[var(--color-primary-700)] focus-visible:ring-[var(--color-primary-700)]",
  secondary:
    "bg-[var(--color-primary-100)] text-[var(--color-primary-900)] hover:bg-[#dce8e1] focus-visible:ring-[var(--color-primary-700)]",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-primary-700)]",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-primary-700)]",
  danger:
    "bg-[var(--color-accent)] text-white hover:bg-[#922f36] focus-visible:ring-[var(--color-accent)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
