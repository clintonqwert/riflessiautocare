import "server-only";

import type { ZodError } from "zod";
import { sendToCrm } from "@/lib/crm";
import { CONTACT_EMAIL } from "@/lib/content/site";

/**
 * Spam gate and delivery shared by the form Server Actions (booking and
 * contact). Each kind of lead has its own webhook — today a Formspree form
 * endpoint — so bookings and questions arrive as separate forms.
 */

const WEBHOOK_ENV = {
  booking: "BOOKING_WEBHOOK_URL",
  contact: "CONTACT_WEBHOOK_URL",
} as const;

export type LeadKind = keyof typeof WEBHOOK_ENV;

/** Minimum ms between form render and submit — bots fill instantly. */
const MIN_TIME_TO_SUBMIT_MS = 3000;

/**
 * Timing check on the hidden `startedAt` stamp.
 *
 * A missing or zero stamp is spam, not a real visitor: the stamp is written
 * on hydration, and these forms only submit through the hydrated action, so a
 * genuine submission always carries one. (`Number("")` is 0 and slips past a
 * bare finite check — that was the bug.) If a form is ever made to work
 * without JS, revisit: an empty stamp would then be a real lead.
 */
export function timingSpamReason(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || raw.trim() === "") return "no-timestamp";
  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return "bad-timestamp";
  if (Date.now() - startedAt < MIN_TIME_TO_SUBMIT_MS) return "too-fast";
  return null;
}

/** The first message per field — what the forms show under each input. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    errors[String(issue.path[0] ?? "form")] ??= issue.message;
  }
  return errors;
}

/**
 * Hands the lead to its webhook. Returns false only when the lead is
 * genuinely unaccounted for — the caller then tells the visitor rather than
 * showing a confirmation for something that never arrived.
 */
export async function deliverLead(
  kind: LeadKind,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const envVar = WEBHOOK_ENV[kind];
  const webhookUrl = process.env[envVar];

  if (webhookUrl) {
    if (await sendToCrm(webhookUrl, payload)) return true;
    console.error(
      `[${kind}] webhook delivery failed after retries; lead:`,
      JSON.stringify(payload),
    );
    return false;
  }

  if (process.env.NODE_ENV === "production") {
    // Misconfigured production: every lead would vanish into the logs.
    console.error(
      `[${kind}] ${envVar} is not set — lead NOT delivered, visitor sent to ${CONTACT_EMAIL}; lead:`,
      JSON.stringify(payload),
    );
    return false;
  }

  // Local/preview without a webhook: keep the lead readable and let the
  // happy path work end to end.
  console.warn(`[${kind}] ${envVar} not set (non-production); lead:`, JSON.stringify(payload));
  return true;
}
