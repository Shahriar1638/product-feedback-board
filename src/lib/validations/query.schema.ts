import { z } from "zod";

export const feedbackQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(["Bug", "Feature", "Improvement"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  sort: z.enum(["trending", "newest", "priority"]).default("newest"),
});

export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;
