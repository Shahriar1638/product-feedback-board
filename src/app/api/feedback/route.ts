import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import { feedbackQuerySchema } from "@/lib/validations/query.schema";
import mongoSanitize from "mongo-sanitize";
import type { QueryFilter } from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parsed = feedbackQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!parsed.success) {
      return Response.json({ error: "Invalid query" }, { status: 400 });
    }

    const { search, category, priority, sort } = parsed.data;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const sanitizedFilter = mongoSanitize(filter) as QueryFilter<typeof Feedback.schema>;

    let query;
    const isSearch = Boolean(search);

    if (isSearch) {
      query = Feedback.find(
        { ...sanitizedFilter, $text: { $search: search! } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
    } else {
      switch (sort) {
        case "trending":
          query = Feedback.find(sanitizedFilter).sort({ voteCount: -1, createdAt: -1 });
          break;
        case "priority":
          query = Feedback.find(sanitizedFilter).sort({
            priorityWeight: -1,
            createdAt: -1,
          });
          break;
        case "newest":
        default:
          query = Feedback.find(sanitizedFilter).sort({ createdAt: -1 });
          break;
      }
    }

    const feedbacks = await query.lean();
    return Response.json(feedbacks);
  } catch (e) {
    console.error("GET /api/feedback error:", e);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
