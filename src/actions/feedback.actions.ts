"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import VoteTracker from "@/models/VoteTracker.model";
import { feedbackSchema } from "@/lib/validations/feedback.schema";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function createFeedback(
  _prev: unknown,
  formData: FormData
): Promise<{ success: boolean; errors?: Record<string, string[]> }> {
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await connectDB();

    await Feedback.create({
      title: sanitizeText(parsed.data.title),
      description: sanitizeText(parsed.data.description),
      category: parsed.data.category,
      priority: parsed.data.priority,
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("createFeedback error:", e);
    return { success: false, errors: { form: ["Service unavailable. Try again."] } };
  }
}

export async function deleteFeedback(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid feedback ID." };
  }

  try {
    await connectDB();

    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Feedback not found." };
    }

    await VoteTracker.deleteMany({ feedbackId: id });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("deleteFeedback error:", e);
    return { success: false, error: "Service unavailable. Try again." };
  }
}
