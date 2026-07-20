import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-10 w-full rounded-[var(--radius-button)] bg-ink border border-fog/20 px-3 font-body text-sm text-paper placeholder:text-fog/50 focus:outline-2 focus:outline-signal-amber focus:outline-offset-0 transition-colors ${
            error ? "border-alert-rust" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="font-mono text-xs text-alert-rust">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
