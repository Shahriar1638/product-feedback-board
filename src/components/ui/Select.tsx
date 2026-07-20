"use client";

import { useState, useRef, useEffect } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="mb-1 block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={label || placeholder}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 w-full items-center justify-between rounded-[var(--radius-button)] bg-ink border border-fog/20 px-3 font-mono text-sm text-paper transition-colors hover:border-fog/40 focus:outline-2 focus:outline-signal-amber"
      >
        <span className={selected ? "text-paper" : "text-fog/50"}>
          {selected?.label || placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-fog transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="listbox" aria-label={label || placeholder} className="absolute z-50 mt-1 w-full rounded-[var(--radius-card)] bg-paper border border-fog/10 shadow-[var(--shadow-modal)] py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left font-mono text-sm transition-colors ${
                option.value === value
                  ? "bg-signal-amber/10 text-signal-amber"
                  : "text-graphite hover:bg-ink/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
