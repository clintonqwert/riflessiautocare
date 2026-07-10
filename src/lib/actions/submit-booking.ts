"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendToCrm } from "@/lib/crm";
import { SERVICE_OPTIONS, VEHICLE_SIZES, type BookingFormValues, type FormResult } from "@/types/forms";

/** Minimum ms between form render and submit — bots fill instantly. */
const MIN_TIME_TO_SUBMIT_MS = 3000;

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
  // Spam checks: honeypot + minimum time-to-submit.
  // Spam takes the normal success path — never reveal detection.
  const honeypot = formData.get("website");
  const startedAt = Number(formData.get("startedAt"));
  const isSpam =
    Boolean(honeypot) ||
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt < MIN_TIME_TO_SUBMIT_MS;

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

  if (!isSpam) {
    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      const delivered = await sendToCrm(webhookUrl, {
        ...parsed.data,
        source: "booking-form",
        submittedAt: new Date().toISOString(),
      });
      if (!delivered) {
        console.error("[booking] webhook delivery failed; lead logged above");
      }
    } else {
      // Dev / pre-launch: keep the lead visible in server logs.
      console.error(
        "[booking] BOOKING_WEBHOOK_URL not set; lead:",
        JSON.stringify(parsed.data),
      );
    }
  }

  redirect("/thank-you");
}
