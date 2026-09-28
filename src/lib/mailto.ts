/**
 * Escape hatches for a lead the server could not hand off: mailto: links with
 * the visitor's own answers pre-written into the email, so recovering the
 * booking or question costs them one tap, not a retype.
 *
 * They only appear after delivery has already failed, so they must never
 * throw and must stay short enough for every mail handler to open.
 */

import type { BookingFormValues, ContactFormValues } from "@/types/forms";
import {
  SERVICE_LABELS,
  VEHICLE_SIZE_LABELS,
  type ServiceSlug,
  type VehicleSize,
} from "@/types/content";
import { CONTACT_EMAIL } from "@/lib/content/site";

/**
 * Longest link we emit. Some handlers (the Windows shell, older Outlook) cut
 * off or refuse mailto: links much past 2,000 characters.
 */
export const MAILTO_MAX_LENGTH = 2000;

/** Closes the free text when it was shortened to fit the link. */
export const CUT_MARKER = " … [shortened to fit this email]";

/**
 * Percent-encodes text for a mailto: query (RFC 6068). URLSearchParams would
 * write spaces as "+", which mail apps show literally. Lone surrogates become
 * U+FFFD first, because encodeURIComponent throws on them (toWellFormed()
 * would do the same, but predates Firefox 119). Line breaks become CRLF, as
 * RFC 6068 asks of a body.
 */
function encode(text: string): string {
  const clean = text.replace(/[\uD800-\uDFFF]/gu, "�").replace(/\r\n?/g, "\n");
  return encodeURIComponent(clean).replaceAll("%0A", "%0D%0A");
}

/** Encodes as much of `text` as fits in `budget` characters, cutting only between code points. */
function encodeWithin(text: string, budget: number): string {
  let out = "";
  for (const char of text.replace(/\r\n?/g, "\n")) {
    const next = encode(char);
    if (out.length + next.length > budget) break;
    out += next;
  }
  return out;
}

/**
 * A mailto: link to CONTACT_EMAIL, pre-written with `fixed` and then
 * `freeText`. The free text is the only long part, so it alone gives way when
 * the link would run past MAILTO_MAX_LENGTH.
 */
function prefilledMailto(subject: string, fixed: string, freeText: string): string {
  const head = `mailto:${CONTACT_EMAIL}?subject=${encode(subject)}&body=${encode(fixed)}`;
  const whole = encode(`${freeText}\n`);
  if (head.length + whole.length <= MAILTO_MAX_LENGTH) return head + whole;

  const marker = encode(`${CUT_MARKER}\n`);
  return head + encodeWithin(freeText, MAILTO_MAX_LENGTH - head.length - marker.length) + marker;
}

export function bookingMailto(values: BookingFormValues | undefined): string {
  const service = values?.service
    ? (SERVICE_LABELS[values.service as ServiceSlug] ?? values.service)
    : "";
  const vehicleSize = values?.vehicleSize
    ? (VEHICLE_SIZE_LABELS[values.vehicleSize as VehicleSize] ?? values.vehicleSize)
    : "";
  const fields = [
    `Name: ${values?.name ?? ""}`,
    `Phone: ${values?.phone ?? ""}`,
    `Vehicle: ${values?.vehicle ?? ""}`,
    `Service: ${service}`,
    `Vehicle size: ${vehicleSize}`,
    `Preferred drop-off day: ${values?.preferredDate ?? ""}`,
    "Notes: ",
  ];
  return prefilledMailto("Booking request", fields.join("\n"), values?.notes ?? "");
}

export function contactMailto(values: ContactFormValues | undefined): string {
  return prefilledMailto("Question", `Name: ${values?.name ?? ""}\nMessage: `, values?.message ?? "");
}
