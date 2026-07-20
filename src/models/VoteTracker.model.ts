import { Schema, model, models, type Document } from "mongoose";
import type { VoteType } from "@/types/feedback.types";

export interface IVoteTracker extends Document {
  feedbackId: Schema.Types.ObjectId;
  voterId: string;
  voteType: VoteType;
  createdAt: Date;
}

const VoteTrackerSchema = new Schema<IVoteTracker>(
  {
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    voterId: { type: String, required: true },
    voteType: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

VoteTrackerSchema.index({ feedbackId: 1, voterId: 1 }, { unique: true });

export default models.VoteTracker ||
  model<IVoteTracker>("VoteTracker", VoteTrackerSchema);
