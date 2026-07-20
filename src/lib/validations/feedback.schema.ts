import { z } from "zod";

export const feedbackSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  category: z.enum(["Bug", "Feature", "Improvement"]),
  priority: z.enum(["Low", "Medium", "High"]),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
