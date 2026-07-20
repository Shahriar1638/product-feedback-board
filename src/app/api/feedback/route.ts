import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import VoteTracker from "@/models/VoteTracker.model";
import { feedbackQuerySchema } from "@/lib/validations/query.schema";
import mongoSanitize from "mongo-sanitize";
import { hashFallbackId } from "@/lib/utils/identifier";
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

    let feedbacks = await query.lean();

    // Attach user's vote status if voter_id cookie is present
    const voterId = request.headers.get("Cookie")?.match(/voter_id=([^;]+)/)?.[1] ?? null;
    if (voterId) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      const fallbackId = hashFallbackId(ip, userAgent);
      const feedbackIds = feedbacks.map((f) => f._id);

      const userVotes = await VoteTracker.find({
        feedbackId: { $in: feedbackIds },
        voterId: { $in: [voterId, fallbackId] },
      }).lean();

      const voteMap = new Map(userVotes.map((v) => [String(v.feedbackId), v.voteType]));
      feedbacks = feedbacks.map((f) => ({
        ...f,
        userVote: voteMap.get(String(f._id)) ?? null,
      }));
    }

    return Response.json(feedbacks);
  } catch (e) {
    console.error("GET /api/feedback error:", e);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
