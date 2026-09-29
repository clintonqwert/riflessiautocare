import "server-only";

import type { ZodError } from "zod";
import { sendToCrm } from "@/lib/crm";
import { CONTACT_EMAIL } from "@/lib/content/site";
import type { BookingFields, ContactFields } from "@/lib/form-schemas";
import { SERVICE_LABELS, VEHICLE_SIZE_LABELS } from "@/types/content";

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
export type Lead = ({ kind: "booking" } & BookingFields) | ({ kind: "contact" } & ContactFields);

/** Minimum time on the page before a real visitor could send a form — bots fill instantly. */
const MIN_TIME_TO_SUBMIT_MS = 3000;

/**
 * What the page's time-on-page field (TIME_ON_PAGE_FIELD) says about a
 * submission. The page measures it on one clock of its own, so nothing here
 * compares the visitor's clock with the server's.
 *
 * - `human`: sent at a person's pace.
 * - `too-fast`: sent under 3 s after the page began loading. A bot; discard.
 * - `unverified`: no usable time, so timing can't tell. The page's
 *   JavaScript adds it, but both forms also submit as plain HTML posts, so
 *   this is what arrives from a visitor with JavaScript off, or one who
 *   sends before the page's scripts finish loading. It could be a bot, so
 *   the lead is delivered flagged, never discarded: a real lead thrown away
 *   behind a "thanks" is the one failure this pipeline refuses.
 */
export type SubmissionTiming = "human" | "too-fast" | "unverified";

export function submissionTiming(raw: FormDataEntryValue | null): SubmissionTiming {
  // `Number("")` is 0, so an empty value must be caught before converting.
  if (typeof raw !== "string" || raw.trim() === "") return "unverified";
  const timeOnPage = Number(raw);
  if (!Number.isFinite(timeOnPage) || timeOnPage < 0) return "unverified";
  return timeOnPage < MIN_TIME_TO_SUBMIT_MS ? "too-fast" : "human";
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
 * Heads an unverified lead's email, so the owner knows why it is flagged.
 * Kept neutral on purpose: Formspree filters on "spammy phrases", and a note
 * that talks about spam or bots could send a real lead to its spam tab.
 */
export const UNVERIFIED_NOTE =
  "The page's timing check didn't run: sent with JavaScript off, or before the page finished loading. Worth a quick look at the details before replying.";

/**
 * Shapes a lead for Formspree, which emails it to the business inbox:
 * `subject` becomes the email's subject line and `email` its Reply-To, so the
 * owner can answer straight from the inbox. Booking emails show the service
 * and size labels the visitor picked, not slugs. An unverified lead says so
 * in its subject line and first field.
 */
function toWebhookPayload(lead: Lead, unverified: boolean): Record<string, unknown> {
  const { kind, ...fields } = lead;
  const title = lead.kind === "booking" ? "Booking request" : "Question";
  const head = {
    subject: `${unverified ? "[No timing check] " : ""}${title} — ${lead.name}`,
    ...(unverified && { timingCheck: UNVERIFIED_NOTE }),
  };
  const stamp = { source: `${kind}-form`, submittedAt: new Date().toISOString() };

  if (lead.kind === "booking") {
    return {
      ...head,
      ...fields,
      service: SERVICE_LABELS[lead.service],
      vehicleSize: VEHICLE_SIZE_LABELS[lead.vehicleSize],
      ...stamp,
    };
  }
  return { ...head, ...fields, ...stamp };
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
export async function deliverLead(
  lead: Lead,
  { unverified = false }: { unverified?: boolean } = {},
): Promise<boolean> {
  const { kind } = lead;
  const envVar = WEBHOOK_ENV[kind];
  const webhookUrl = process.env[envVar];
  const payload = toWebhookPayload(lead, unverified);

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
