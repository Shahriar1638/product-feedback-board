"use client";

import { useEffect, useState } from "react";
import { useFeedbackQueryState } from "@/hooks/useFeedbackQueryState";
import FeedbackGrid from "./FeedbackGrid";
import type { IFeedback } from "@/models/Feedback.model";

interface FeedbackListProps {
  initialData: IFeedback[];
}

export default function FeedbackList({ initialData }: FeedbackListProps) {
  const { debouncedSearch, category, priority, sort } = useFeedbackQueryState();
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Skip first render — initial data comes from server
    if (!initialized) {
      setInitialized(true);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (priority) params.set("priority", priority);
    if (sort) params.set("sort", sort);

    fetch(`/api/feedback?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setFeedbacks(data))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, priority, sort, initialized]);

  return <FeedbackGrid feedbacks={feedbacks} loading={loading} />;
}
