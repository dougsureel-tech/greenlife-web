import "server-only";
import { getClient } from "./db";

const SITE = "greenlife";

export async function getCompletedSteps(clerkUserId: string): Promise<Set<string>> {
  const sql = getClient();
  const rows = (await sql`
    SELECT step_id FROM customer_learning_progress
    WHERE clerk_user_id = ${clerkUserId} AND site = ${SITE}
  `) as Array<{ step_id: string }>;
  return new Set(rows.map((r) => r.step_id));
}

export async function markStepCompleted(clerkUserId: string, stepId: string): Promise<void> {
  const sql = getClient();
  const id = `clp_${SITE}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await sql`
    INSERT INTO customer_learning_progress (id, clerk_user_id, step_id, site)
    VALUES (${id}, ${clerkUserId}, ${stepId}, ${SITE})
    ON CONFLICT (clerk_user_id, step_id, site) DO NOTHING
  `;
}

export async function unmarkStep(clerkUserId: string, stepId: string): Promise<void> {
  const sql = getClient();
  await sql`
    DELETE FROM customer_learning_progress
    WHERE clerk_user_id = ${clerkUserId} AND step_id = ${stepId} AND site = ${SITE}
  `;
}
