/**
 * Escape hatch for a lead the server could not hand off: a mailto: link with
 * the visitor's own answers pre-written into the email, so recovering the
 * booking costs them one tap, not a retype.
 *
 * It only appears after delivery has already failed, so it must never throw
 * and must stay short enough for every mail handler to open.
 */

import type { BookingFormValues } from "@/types/forms";
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

/** Closes the notes when they were shortened to fit the link. */
export const NOTES_CUT_MARKER = " … [note shortened to fit this email]";

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
  const head = `mailto:${CONTACT_EMAIL}?subject=${encode("Booking request")}&body=${encode(fields.join("\n"))}`;

  // Notes are the only long free text, so they give way when the link is too long.
  const notes = values?.notes ?? "";
  const whole = encode(`${notes}\n`);
  if (head.length + whole.length <= MAILTO_MAX_LENGTH) return head + whole;

  const marker = encode(`${NOTES_CUT_MARKER}\n`);
  return head + encodeWithin(notes, MAILTO_MAX_LENGTH - head.length - marker.length) + marker;
}
