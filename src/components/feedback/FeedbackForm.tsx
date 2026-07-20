"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import { createFeedback } from "@/actions/feedback.actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const CATEGORIES = ["Bug", "Feature", "Improvement"] as const;
const PRIORITIES = ["Low", "Medium", "High"] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending} className="w-full bg-current-teal text-graphite hover:brightness-110">
      {pending ? "Submitting..." : "Submit Feedback"}
    </Button>
  );
}

export default function FeedbackForm({ onClose }: { onClose?: () => void }) {
  const [state, formAction] = useActionState(createFeedback, { success: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onClose?.();
    }
  }, [state.success, onClose]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <Input
        name="title"
        label="Title"
        placeholder="Brief summary of your feedback"
        required
        minLength={5}
        maxLength={120}
        error={state.errors?.title?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe the issue or suggestion in detail"
          required
          minLength={10}
          maxLength={2000}
          aria-label="Description"
          className="w-full rounded-[var(--radius-button)] bg-ink border border-fog/20 px-3 py-2 font-body text-sm text-paper placeholder:text-fog/50 focus:outline-2 focus:outline-signal-amber resize-none"
        />
        {state.errors?.description?.[0] && (
          <p className="font-mono text-xs text-alert-rust">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Category
        </label>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex-1">
              <input type="radio" name="category" value={cat} defaultChecked={cat === "Feature"} className="peer sr-only" aria-label={cat} />
              <div className="cursor-pointer rounded-[var(--radius-button)] border border-fog/20 py-2 text-center font-mono text-xs uppercase tracking-wider text-fog transition-colors hover:border-fog/40 peer-checked:border-current-teal peer-checked:bg-current-teal/10 peer-checked:text-current-teal">
                {cat}
              </div>
            </label>
          ))}
        </div>
        {state.errors?.category?.[0] && (
          <p className="font-mono text-xs text-alert-rust">{state.errors.category[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map((pri) => (
            <label key={pri} className="flex-1">
              <input type="radio" name="priority" value={pri} defaultChecked={pri === "Medium"} className="peer sr-only" aria-label={pri} />
              <div className="cursor-pointer rounded-[var(--radius-button)] border border-fog/20 py-2 text-center font-mono text-xs uppercase tracking-wider text-fog transition-colors hover:border-fog/40 peer-checked:border-signal-amber peer-checked:bg-signal-amber/10 peer-checked:text-signal-amber">
                {pri}
              </div>
            </label>
          ))}
        </div>
        {state.errors?.priority?.[0] && (
          <p className="font-mono text-xs text-alert-rust">{state.errors.priority[0]}</p>
        )}
      </div>

      {state.errors?.form?.[0] && (
        <p className="font-mono text-xs text-alert-rust">{state.errors.form[0]}</p>
      )}

      <SubmitButton />
    </form>
  );
}
