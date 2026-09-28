"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { deliverLead, fieldErrors, timingSpamReason } from "@/lib/leads";
import { SERVICE_LABELS, VEHICLE_SIZE_LABELS } from "@/types/content";
import { SERVICE_OPTIONS, VEHICLE_SIZES, type BookingFormValues, type FormResult } from "@/types/forms";

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
    return { ok: false, errors: fieldErrors(parsed.error), values: submittedValues };
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

  const delivered = await deliverLead("booking", {
    // Formspree uses `subject` as the email's subject line and `email` as its Reply-To.
    subject: `Booking request — ${parsed.data.name}`,
    ...parsed.data,
    service: SERVICE_LABELS[parsed.data.service],
    vehicleSize: VEHICLE_SIZE_LABELS[parsed.data.vehicleSize],
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
