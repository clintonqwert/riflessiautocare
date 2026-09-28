"use server";

import { z } from "zod";
import { deliverLead, fieldErrors, timingSpamReason } from "@/lib/leads";
import {
  FREE_TEXT_MAX_LABEL,
  FREE_TEXT_MAX_LENGTH,
  type ContactFormValues,
  type FormResult,
} from "@/types/forms";

/**
 * Shown when the message could not be handed off. The form pairs this with a
 * mailto fallback, so `errors.form` is only ever set by a delivery failure —
 * validation problems always come back as per-field errors.
 */
const DELIVERY_FAILED_MESSAGE =
  "Your message could not be sent — it did not reach the inbox.";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Tell me a little more — a sentence or two is plenty.")
    .max(FREE_TEXT_MAX_LENGTH, `Please keep your question to ${FREE_TEXT_MAX_LABEL} characters or fewer.`),
});

type ContactResult = FormResult<ContactFormValues>;

export async function submitContact(
  _prevState: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  // Honeypot: unambiguous bot. Take the normal success path so detection is
  // never revealed, and deliver nothing.
  if (formData.get("website")) return { ok: true };

  const spamReason = timingSpamReason(formData.get("startedAt"));

  const submittedValues: ContactFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(submittedValues);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values: submittedValues };
  }

  if (spamReason) {
    // Success path, no delivery — see submit-booking.ts.
    console.warn(
      `[contact] discarded as spam (${spamReason}); submission:`,
      JSON.stringify(submittedValues),
    );
    return { ok: true };
  }

  const delivered = await deliverLead({ kind: "contact", ...parsed.data });

  if (!delivered) {
    return { ok: false, errors: { form: DELIVERY_FAILED_MESSAGE }, values: submittedValues };
  }

  return { ok: true };
}
