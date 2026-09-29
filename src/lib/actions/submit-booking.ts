"use server";

import { redirect } from "next/navigation";
import { bookingSchema } from "@/lib/form-schemas";
import { deliverLead, fieldErrors, submissionTiming } from "@/lib/leads";
import type { BookingFormValues, FormResult } from "@/types/forms";

/**
 * Shown when the lead could not be handed off. The form pairs this with a
 * mailto fallback, so `errors.form` is only ever set by a delivery failure —
 * validation problems always come back as per-field errors.
 */
const DELIVERY_FAILED_MESSAGE =
  "Your request could not be sent — it did not reach the booking inbox, so nothing has been booked yet.";

type BookingResult = FormResult<BookingFormValues>;

export async function submitBooking(
  _prevState: BookingResult | null,
  formData: FormData,
): Promise<BookingResult> {
  // Honeypot: unambiguous bot. Take the normal success path so detection is
  // never revealed, and deliver nothing.
  if (formData.get("website")) {
    redirect("/thank-you");
  }

  const timing = submissionTiming(formData.get("startedAt"));

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
    return { ok: false, errors: fieldErrors(parsed.error), values: submittedValues };
  }

  if (timing === "too-fast") {
    // Success path, no delivery — detection is never revealed. Logged rather
    // than dropped in silence, so a false positive is at least diagnosable.
    console.warn("[booking] discarded as spam (too-fast); submission:", JSON.stringify(submittedValues));
    redirect("/thank-you");
  }

  const delivered = await deliverLead(
    { kind: "booking", ...parsed.data },
    { unverified: timing === "unverified" },
  );

  if (!delivered) {
    return {
      ok: false,
      errors: { form: DELIVERY_FAILED_MESSAGE },
      values: submittedValues,
    };
  }

  redirect("/thank-you");
}
