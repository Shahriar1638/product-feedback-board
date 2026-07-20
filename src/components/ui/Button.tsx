import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-mono font-medium transition-all duration-[var(--dur-micro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-signal-amber text-graphite hover:brightness-110 active:scale-[0.97]",
      secondary: "bg-ink-raised text-paper border border-fog/20 hover:bg-fog/10 active:scale-[0.97]",
      danger: "bg-alert-rust text-paper hover:brightness-110 active:scale-[0.97]",
      ghost: "bg-transparent text-fog hover:text-paper hover:bg-fog/10 active:scale-[0.97]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-[var(--radius-button)]",
      md: "h-10 px-5 text-sm rounded-[var(--radius-button)]",
      lg: "h-12 px-6 text-base rounded-[var(--radius-button)]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
