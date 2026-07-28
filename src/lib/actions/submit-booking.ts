"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendToCrm } from "@/lib/crm";
import { CONTACT_EMAIL } from "@/lib/content/site";
import { SERVICE_OPTIONS, VEHICLE_SIZES, type BookingFormValues, type FormResult } from "@/types/forms";

/** Minimum ms between form render and submit — bots fill instantly. */
const MIN_TIME_TO_SUBMIT_MS = 3000;

/**
 * Shown when the lead could not be handed off. The form pairs this with a
 * mailto fallback, so `errors.form` is only ever set by a delivery failure —
 * validation problems always come back as per-field errors.
 */
const DELIVERY_FAILED_MESSAGE =
  "Your request could not be sent — it did not reach the booking inbox, so nothing has been booked yet.";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number so your slot can be confirmed."),
  vehicle: z
    .string()
    .trim()
    .min(3, "Tell me the year, make, and model — e.g. 2021 Mazda CX-5."),
  service: z.enum(SERVICE_OPTIONS, { error: "Please choose a service." }),
  vehicleSize: z.enum(VEHICLE_SIZES, { error: "Please choose a vehicle size." }),
  preferredDate: z.string().trim().min(1, "Pick a preferred drop-off day."),
  notes: z.string().trim().optional(),
});

/**
 * Timing check on the hidden `startedAt` stamp.
 *
 * A missing or zero stamp is spam, not a real visitor: the stamp is written
 * on hydration, and this form only submits through the hydrated action, so a
 * genuine submission always carries one. (`Number("")` is 0 and slips past a
 * bare finite check — that was the bug.) If this form is ever made to work
 * without JS, revisit: an empty stamp would then be a real lead.
 */
function timingSpamReason(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || raw.trim() === "") return "no-timestamp";
  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return "bad-timestamp";
  if (Date.now() - startedAt < MIN_TIME_TO_SUBMIT_MS) return "too-fast";
  return null;
}

export async function submitBooking(
  _prevState: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  // Honeypot: unambiguous bot. Take the normal success path so detection is
  // never revealed, and deliver nothing.
  if (formData.get("website")) {
    redirect("/thank-you");
  }

  const spamReason = timingSpamReason(formData.get("startedAt"));

  // Capture safe-to-echo values before validation (excludes honeypot/startedAt).
  const submittedValues: BookingFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    vehicle: String(formData.get("vehicle") ?? ""),
    service: String(formData.get("service") ?? ""),
    vehicleSize: String(formData.get("vehicleSize") ?? ""),
    preferredDate: String(formData.get("preferredDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = bookingSchema.safeParse({
    ...submittedValues,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      errors[field] ??= issue.message;
    }
    return { ok: false, errors, values: submittedValues };
  }

  if (spamReason) {
    // Success path, no delivery — detection is never revealed. Logged rather
    // than dropped in silence, so a false positive is at least diagnosable.
    console.warn(
      `[booking] discarded as spam (${spamReason}); submission:`,
      JSON.stringify(submittedValues),
    );
    redirect("/thank-you");
  }

  const delivered = await deliverLead({
    ...parsed.data,
    source: "booking-form",
    submittedAt: new Date().toISOString(),
  });

  if (!delivered) {
    return {
      ok: false,
      errors: { form: DELIVERY_FAILED_MESSAGE },
      values: submittedValues,
    };
  }

  redirect("/thank-you");
}

/**
 * Hands the lead to the CRM webhook. Returns false only when the lead is
 * genuinely unaccounted for — the caller then tells the visitor rather than
 * showing a confirmation for something that never arrived.
 */
async function deliverLead(payload: Record<string, unknown>): Promise<boolean> {
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;

  if (webhookUrl) {
    if (await sendToCrm(webhookUrl, payload)) return true;
    console.error(
      "[booking] webhook delivery failed after retries; lead:",
      JSON.stringify(payload),
    );
    return false;
  }

  if (process.env.NODE_ENV === "production") {
    // Misconfigured production: every lead would vanish into the logs.
    console.error(
      `[booking] BOOKING_WEBHOOK_URL is not set — lead NOT delivered, visitor sent to ${CONTACT_EMAIL}; lead:`,
      JSON.stringify(payload),
    );
    return false;
  }

  // Local/preview without a webhook: keep the lead readable and let the
  // happy path work end to end.
  console.warn(
    "[booking] BOOKING_WEBHOOK_URL not set (non-production); lead:",
    JSON.stringify(payload),
  );
  return true;
}
