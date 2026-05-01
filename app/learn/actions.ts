"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { markStepCompleted, unmarkStep } from "@/lib/learn-db";
import { LEARN_TOPICS } from "@/lib/learn-topics";

const VALID_STEPS = new Set(LEARN_TOPICS.map((t) => t.id));

export async function markLearnStepDone(stepId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  if (!VALID_STEPS.has(stepId)) throw new Error("Invalid step");
  await markStepCompleted(userId, stepId);
  revalidatePath("/learn");
}

export async function unmarkLearnStep(stepId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  if (!VALID_STEPS.has(stepId)) throw new Error("Invalid step");
  await unmarkStep(userId, stepId);
  revalidatePath("/learn");
}
