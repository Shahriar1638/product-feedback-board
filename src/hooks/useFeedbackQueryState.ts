"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useDebounce } from "./useDebounce";

export function useFeedbackQueryState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const sort = searchParams.get("sort") || "newest";

  const debouncedSearch = useDebounce(search, 400);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router]
  );

  return {
    search,
    category,
    priority,
    sort,
    debouncedSearch,
    setParam,
    isPending,
  };
}
