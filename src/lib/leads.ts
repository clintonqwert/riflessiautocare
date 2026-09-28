import "server-only";

import type { ZodError } from "zod";
import { sendToCrm } from "@/lib/crm";
import { CONTACT_EMAIL } from "@/lib/content/site";
import {
  SERVICE_LABELS,
  VEHICLE_SIZE_LABELS,
  type ServiceSlug,
  type VehicleSize,
} from "@/types/content";

/**
 * Spam gate and delivery shared by the form Server Actions (booking and
 * contact). Each kind of lead has its own webhook — today a Formspree form
 * endpoint — so bookings and questions arrive as separate forms. Everything
 * provider-specific lives in this file: switching provider means changing
 * `toWebhookPayload` and the env vars, not the forms or their actions.
 */

const WEBHOOK_ENV = {
  booking: "BOOKING_WEBHOOK_URL",
  contact: "CONTACT_WEBHOOK_URL",
} as const;

/** A validated submission, as each form's Server Action hands it over. */
export type Lead =
  | {
      kind: "booking";
      name: string;
      email: string;
      phone: string;
      vehicle: string;
      service: ServiceSlug;
      vehicleSize: VehicleSize;
      preferredDate: string;
      notes?: string;
    }
  | { kind: "contact"; name: string; email: string; message: string };

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
 * Shapes a lead for Formspree, which emails it to the business inbox:
 * `subject` becomes the email's subject line and `email` its Reply-To, so the
 * owner can answer straight from the inbox. Booking emails show the service
 * and size labels the visitor picked, not slugs.
 */
function toWebhookPayload(lead: Lead): Record<string, unknown> {
  const { kind, ...fields } = lead;
  const stamp = { source: `${kind}-form`, submittedAt: new Date().toISOString() };

  if (lead.kind === "booking") {
    return {
      subject: `Booking request — ${lead.name}`,
      ...fields,
      service: SERVICE_LABELS[lead.service],
      vehicleSize: VEHICLE_SIZE_LABELS[lead.vehicleSize],
      ...stamp,
    };
  }
  return { subject: `Question — ${lead.name}`, ...fields, ...stamp };
}

/**
 * True only on the live site. Vercel previews also run with
 * NODE_ENV=production, so on Vercel the deployment's own VERCEL_ENV decides;
 * anywhere else (e.g. a local `next start`) NODE_ENV does.
 */
function isLiveSite(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv ? vercelEnv === "production" : process.env.NODE_ENV === "production";
}

/**
 * Hands the lead to its webhook. Returns false only when the lead is
 * genuinely unaccounted for — the caller then tells the visitor rather than
 * showing a confirmation for something that never arrived.
 */
export async function deliverLead(lead: Lead): Promise<boolean> {
  const { kind } = lead;
  const envVar = WEBHOOK_ENV[kind];
  const webhookUrl = process.env[envVar];
  const payload = toWebhookPayload(lead);

  if (webhookUrl) {
    if (await sendToCrm(webhookUrl, payload)) return true;
    console.error(
      `[${kind}] webhook delivery failed after retries; lead:`,
      JSON.stringify(payload),
    );
    return false;
  }

  if (isLiveSite()) {
    // Misconfigured production: every lead would vanish into the logs.
    console.error(
      `[${kind}] ${envVar} is not set — lead NOT delivered, visitor sent to ${CONTACT_EMAIL}; lead:`,
      JSON.stringify(payload),
    );
    return false;
  }

  // Local dev and Vercel previews without a webhook: keep the lead readable
  // and let the happy path work end to end, without emailing the owner.
  console.warn(`[${kind}] ${envVar} not set (not the live site); lead:`, JSON.stringify(payload));
  return true;
}
