/** Form data contracts shared by the booking form and its Server Action. */

import { VEHICLE_SIZES, type ServiceSlug } from "@/types/content";

export const SERVICE_OPTIONS: ServiceSlug[] = [
  "interior-detailing",
  "exterior-detailing",
  "full-detail",
  "ceramic-coating",
];

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

export type FormResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string>; values: BookingFormValues };
