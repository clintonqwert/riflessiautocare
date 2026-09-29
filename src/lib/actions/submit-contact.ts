"use server";

import { contactSchema } from "@/lib/form-schemas";
import { deliverLead, fieldErrors, submissionTiming } from "@/lib/leads";
import type { ContactFormValues, FormResult } from "@/types/forms";

/**
 * Shown when the message could not be handed off. The form pairs this with a
 * mailto fallback, so `errors.form` is only ever set by a delivery failure —
 * validation problems always come back as per-field errors.
 */
const DELIVERY_FAILED_MESSAGE =
  "Your message could not be sent — it did not reach the inbox.";

type ContactResult = FormResult<ContactFormValues>;

export async function submitContact(
  _prevState: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  // Honeypot: unambiguous bot. Take the normal success path so detection is
  // never revealed, and deliver nothing.
  if (formData.get("website")) return { ok: true };

  const timing = submissionTiming(formData.get("startedAt"));

  const submittedValues: ContactFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(submittedValues);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values: submittedValues };
  }

  if (timing === "too-fast") {
    // Success path, no delivery — see submit-booking.ts.
    console.warn("[contact] discarded as spam (too-fast); submission:", JSON.stringify(submittedValues));
    return { ok: true };
  }

  const delivered = await deliverLead(
    { kind: "contact", ...parsed.data },
    { unverified: timing === "unverified" },
  );

  if (!delivered) {
    return { ok: false, errors: { form: DELIVERY_FAILED_MESSAGE }, values: submittedValues };
  }

  return { ok: true };
}
