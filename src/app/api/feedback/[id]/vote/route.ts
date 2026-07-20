import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import VoteTracker from "@/models/VoteTracker.model";

function parseVoterId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/voter_id=([^;]+)/);
  return match?.[1] ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid feedback ID" }, { status: 400 });
    }

    const voterId = parseVoterId(request.headers.get("Cookie"));
    if (!voterId) {
      return NextResponse.json({ error: "Missing voter identity" }, { status: 400 });
    }

    const body = await request.json();
    const { voteType } = body as { voteType: "up" | "down" };

    if (voteType !== "up" && voteType !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const feedbackId = new mongoose.Types.ObjectId(id);

    const existingTracker = await VoteTracker.findOne({ feedbackId, voterId });

    if (!existingTracker) {
      // First vote — unique index as lock
      try {
        await VoteTracker.create({ feedbackId, voterId, voteType });
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && (e as { code: number }).code === 11000) {
          return NextResponse.json({ error: "Already voted" }, { status: 409 });
        }
        throw e;
      }

      // Atomic increment on Feedback
      const update =
        voteType === "up"
          ? { $inc: { upvotes: 1, voteCount: 1 } }
          : { $inc: { downvotes: 1, voteCount: 1 } };

      const updated = await Feedback.findByIdAndUpdate(feedbackId, update, { new: true });
      if (!updated) {
        return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
      }

      return NextResponse.json({
        feedbackId: id,
        voteType,
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
      });
    }

    // Existing vote — same type = no-op, different type = transaction
    if (existingTracker.voteType === voteType) {
      return NextResponse.json({ error: "Already voted this way" }, { status: 409 });
    }

    // Switch vote — atomic multi-document transaction
    const session = await mongoose.startSession();
    try {
      let result: { upvotes: number; downvotes: number } | null = null;

      await session.withTransaction(async () => {
        await VoteTracker.updateOne(
          { _id: existingTracker._id },
          { $set: { voteType } },
          { session }
        );

        const oldInc =
          existingTracker.voteType === "up"
            ? { $inc: { upvotes: -1, downvotes: 1 } }
            : { $inc: { upvotes: 1, downvotes: -1 } };

        const updated = await Feedback.findByIdAndUpdate(feedbackId, oldInc, {
          new: true,
          session,
        });

        if (!updated) {
          throw new Error("Feedback not found");
        }

        result = { upvotes: updated.upvotes, downvotes: updated.downvotes };
      });

      return NextResponse.json({
        feedbackId: id,
        voteType,
        upvotes: result!.upvotes,
        downvotes: result!.downvotes,
      });
    } finally {
      await session.endSession();
    }
  } catch (e) {
    console.error("POST /api/feedback/[id]/vote error:", e);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
