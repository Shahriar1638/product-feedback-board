"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { deleteFeedback } from "@/actions/feedback.actions";

interface DeleteConfirmModalProps {
  feedbackId: string;
  open: boolean;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  feedbackId,
  open,
  onClose,
}: DeleteConfirmModalProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleConfirm = useCallback(async () => {
    setPending(true);
    const result = await deleteFeedback(feedbackId);
    setPending(false);

    if (result.success) {
      onClose();
      router.refresh();
    }
  }, [feedbackId, onClose, router]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="delete-title">
      <div className="flex flex-col gap-4">
        <h2 id="delete-title" className="font-display text-lg font-semibold text-graphite">
          Delete Feedback?
        </h2>
        <p className="font-body text-sm text-graphite/70">
          This action cannot be undone. The feedback and all its votes will be permanently removed.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
