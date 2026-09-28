/** Form data contracts shared by the booking and contact forms and their Server Actions. */

import { SERVICE_SLUGS, VEHICLE_SIZES, type ServiceSlug } from "@/types/content";

export const SERVICE_OPTIONS: readonly ServiceSlug[] = SERVICE_SLUGS;

export { VEHICLE_SIZES };

/** Safe-to-echo values returned alongside validation errors (excludes honeypot/startedAt). */
export interface BookingFormValues {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  service: string;
  vehicleSize: string;
  preferredDate: string;
  notes: string;
}

/** Safe-to-echo values from the contact form (excludes honeypot/startedAt). */
export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export type FormResult<Values = BookingFormValues> =
  | { ok: true }
  | { ok: false; errors: Record<string, string>; values: Values };
