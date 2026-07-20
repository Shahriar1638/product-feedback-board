"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useFeedbackQueryState } from "@/hooks/useFeedbackQueryState";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Bug", value: "Bug" },
  { label: "Feature", value: "Feature" },
  { label: "Improvement", value: "Improvement" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Trending", value: "trending" },
  { label: "Highest Priority", value: "priority" },
];

export default function FeedbackFilters() {
  const { search, category, priority, sort, setParam } =
    useFeedbackQueryState();

  return (
    <div className="board-filters sticky top-[72px] z-30 flex flex-col gap-3 border-b border-paper/8 bg-ink-raised px-6 py-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setParam("search", e.target.value)}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(v) => setParam("category", v)}
          placeholder="Category"
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(v) => setParam("priority", v)}
          placeholder="Priority"
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={SORT_OPTIONS}
          value={sort}
          onChange={(v) => setParam("sort", v)}
          placeholder="Sort"
        />
      </div>
    </div>
  );
}
