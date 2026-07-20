"use client";

import { useActionState, useEffect, useRef, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFeedback } from "@/actions/feedback.actions";
import { feedbackSchema, type FeedbackInput } from "@/lib/validations/feedback.schema";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

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
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { title: "", description: "", category: "Feature", priority: "Medium" },
  });

  const [state, formAction] = useActionState(createFeedback, { success: false });

  const hasError = useMemo(
    () => Object.keys(errors).length > 0 || !!state.errors?.form,
    [errors, state.errors]
  );

  useEffect(() => {
    if (state.success) {
      addToast("Feedback submitted", "success");
      reset();
      onClose?.();
    }
  }, [state.success, addToast, reset, onClose]);

  const onSubmit = handleSubmit(async (data) => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("category", data.category);
    fd.append("priority", data.priority);
    formAction(fd);
  });

  return (
    <motion.div
      animate={hasError ? { x: [0, -4, 4, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
      <Input
        label="Title"
        placeholder="Brief summary of your feedback"
        {...register("title")}
        error={errors.title?.message || state.errors?.title?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe the issue or suggestion in detail"
          aria-label="Description"
          className={`w-full rounded-[var(--radius-button)] border bg-ink px-3 py-2 font-body text-sm text-paper placeholder:text-fog/50 focus:outline-2 focus:outline-signal-amber resize-none ${
            errors.description ? "border-alert-rust" : "border-fog/20"
          }`}
        />
        {(errors.description?.message || state.errors?.description?.[0]) && (
          <p className="font-mono text-xs text-alert-rust">
            {errors.description?.message || state.errors?.description?.[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Category
        </label>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex-1">
              <input
                type="radio"
                value={cat}
                defaultChecked={cat === "Feature"}
                {...register("category")}
                className="peer sr-only"
                aria-label={cat}
              />
              <div className="cursor-pointer rounded-[var(--radius-button)] border border-fog/20 py-2 text-center font-mono text-xs uppercase tracking-wider text-fog transition-colors hover:border-fog/40 peer-checked:border-current-teal peer-checked:bg-current-teal/10 peer-checked:text-current-teal">
                {cat}
              </div>
            </label>
          ))}
        </div>
        {(errors.category?.message || state.errors?.category?.[0]) && (
          <p className="font-mono text-xs text-alert-rust">
            {errors.category?.message || state.errors?.category?.[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fog">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map((pri) => (
            <label key={pri} className="flex-1">
              <input
                type="radio"
                value={pri}
                defaultChecked={pri === "Medium"}
                {...register("priority")}
                className="peer sr-only"
                aria-label={pri}
              />
              <div className="cursor-pointer rounded-[var(--radius-button)] border border-fog/20 py-2 text-center font-mono text-xs uppercase tracking-wider text-fog transition-colors hover:border-fog/40 peer-checked:border-signal-amber peer-checked:bg-signal-amber/10 peer-checked:text-signal-amber">
                {pri}
              </div>
            </label>
          ))}
        </div>
        {(errors.priority?.message || state.errors?.priority?.[0]) && (
          <p className="font-mono text-xs text-alert-rust">
            {errors.priority?.message || state.errors?.priority?.[0]}
          </p>
        )}
      </div>

      {state.errors?.form?.[0] && (
        <p className="font-mono text-xs text-alert-rust">{state.errors?.form?.[0]}</p>
      )}

      <SubmitButton />
    </form>
    </motion.div>
  );
}
