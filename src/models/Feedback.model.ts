import { Schema, model, models, type Document } from "mongoose";
import type { Category, Priority } from "@/types/feedback.types";

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  priorityWeight: number;
  upvotes: number;
  downvotes: number;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const FeedbackSchema = new Schema<IFeedback>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ["Bug", "Feature", "Improvement"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    priorityWeight: { type: Number, required: true },
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
    voteCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

FeedbackSchema.pre("validate", function () {
  if (this.priority) {
    this.priorityWeight = PRIORITY_WEIGHT[this.priority as Priority];
  }
});

FeedbackSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 5, description: 1 }, name: "FeedbackTextIndex" }
);
FeedbackSchema.index({ category: 1, priority: 1, createdAt: -1 });
FeedbackSchema.index({ category: 1, priority: 1, voteCount: -1 });
FeedbackSchema.index({ category: 1, priority: 1, priorityWeight: -1 });
FeedbackSchema.index({ createdAt: -1 });

export default models.Feedback ||
  model<IFeedback>("Feedback", FeedbackSchema);
