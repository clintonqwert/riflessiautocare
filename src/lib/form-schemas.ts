import { z } from "zod";
import {
  FREE_TEXT_MAX_LABEL,
  FREE_TEXT_MAX_LENGTH,
  SERVICE_OPTIONS,
  VEHICLE_SIZES,
} from "@/types/forms";

/**
 * What each lead form accepts, defined once. The Server Actions validate with
 * these, and src/lib/leads.ts derives the shape it delivers from them, so a
 * field added here reaches the webhook with its type checked all the way.
 */

/**
 * Free text from a textarea, with each line break counted once. Browsers
 * submit a textarea's line breaks as CRLF, so a raw length check would count
 * every break twice and reject text that is under the limit.
 */
function freeText(maxMessage: string) {
  return z
    .string()
    .transform((text) => text.replace(/\r\n?/g, "\n"))
    .pipe(z.string().trim().max(FREE_TEXT_MAX_LENGTH, maxMessage));
}

export const bookingSchema = z.object({
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
  notes: freeText(`Please keep your notes to ${FREE_TEXT_MAX_LABEL} characters or fewer.`).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
  message: freeText(`Please keep your question to ${FREE_TEXT_MAX_LABEL} characters or fewer.`).pipe(
    z.string().min(10, "Tell me a little more — a sentence or two is plenty."),
  ),
});

export type BookingFields = z.infer<typeof bookingSchema>;
export type ContactFields = z.infer<typeof contactSchema>;
