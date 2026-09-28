import { describe, expect, it } from "vitest";
import { bookingMailto, contactMailto, CUT_MARKER, MAILTO_MAX_LENGTH } from "@/lib/mailto";
import { CONTACT_EMAIL } from "@/lib/content/site";
import { SERVICE_LABELS, VEHICLE_SIZE_LABELS } from "@/types/content";
import type { BookingFormValues, ContactFormValues } from "@/types/forms";

/** Reads a link the way a mail app does (RFC 6068): percent-decoding only, so "+" stays "+". */
function openMailto(href: string) {
  const [to, query] = href.replace(/^mailto:/, "").split("?");
  const fields = new Map(
    query.split("&").map((pair) => {
      const [key, value] = pair.split("=");
      return [key, decodeURIComponent(value)];
    }),
  );
  return { to, subject: fields.get("subject"), body: fields.get("body") ?? "" };
}

/** The notes as they arrive in the email, minus the "Notes: " label. */
function notesIn(body: string): string {
  return body.slice(body.indexOf("Notes: ") + "Notes: ".length);
}

const values: BookingFormValues = {
  name: "Alex Rossi",
  email: "alex@example.com",
  phone: "+1 604 555 0199",
  vehicle: "2021 Mazda CX-5",
  service: "full-detail",
  vehicleSize: "suv-crossover",
  preferredDate: "2026-10-03",
  notes: "Swirls & haze = bad? #2 door, 50% worse 🚗\r\nKeys in the lockbox.",
};

describe("bookingMailto", () => {
  it("pre-writes every answer exactly, one per CRLF line", () => {
    const mail = openMailto(bookingMailto(values));

    expect(mail.to).toBe(CONTACT_EMAIL);
    expect(mail.subject).toBe("Booking request");
    expect(mail.body).toBe(
      [
        "Name: Alex Rossi",
        "Phone: +1 604 555 0199",
        "Vehicle: 2021 Mazda CX-5",
        `Service: ${SERVICE_LABELS["full-detail"]}`,
        `Vehicle size: ${VEHICLE_SIZE_LABELS["suv-crossover"]}`,
        "Preferred drop-off day: 2026-10-03",
        "Notes: Swirls & haze = bad? #2 door, 50% worse 🚗",
        "Keys in the lockbox.",
        "",
      ].join("\r\n"),
    );
  });

  it("never writes a space as '+', which mail apps show literally", () => {
    expect(bookingMailto(values)).not.toContain("+");
  });

  it("turns every kind of line break in the notes into CRLF", () => {
    const { body } = openMailto(bookingMailto({ ...values, notes: "a\nb\rc\r\nd" }));

    expect(notesIn(body)).toBe("a\r\nb\r\nc\r\nd\r\n");
  });

  it("does not throw on a lone surrogate", () => {
    const { body } = openMailto(bookingMailto({ ...values, notes: "cut emoji \uD83D" }));

    expect(notesIn(body)).toBe("cut emoji �\r\n");
  });

  it("builds a link with every field blank when there are no values", () => {
    const { body } = openMailto(bookingMailto(undefined));

    expect(body).toContain("Name: \r\nPhone: \r\n");
    expect(notesIn(body)).toBe("\r\n");
  });

  it.each([
    ["words", "Deep scratches on both doors, please look. ".repeat(100)],
    ["emoji", "🚗".repeat(1000)],
  ])("shortens long notes (%s) to fit the link, whole characters only", (_, notes) => {
    const href = bookingMailto({ ...values, notes });

    expect(href.length).toBeLessThanOrEqual(MAILTO_MAX_LENGTH);
    const kept = notesIn(openMailto(href).body);
    expect(kept.endsWith(`${CUT_MARKER}\r\n`)).toBe(true);
    const start = kept.slice(0, kept.indexOf(CUT_MARKER));
    expect(start.length).toBeGreaterThan(0);
    expect(notes.startsWith(start)).toBe(true);
    expect(start).not.toContain("�");
  });
});

describe("contactMailto", () => {
  const question: ContactFormValues = {
    name: "Alex Rossi",
    email: "alex@example.com",
    message: "Do you coat wheels + calipers? Mine are 20\" & gloss black.\r\nThanks!",
  };

  it("pre-writes the name and message exactly", () => {
    const mail = openMailto(contactMailto(question));

    expect(mail.to).toBe(CONTACT_EMAIL);
    expect(mail.subject).toBe("Question");
    expect(mail.body).toBe(
      'Name: Alex Rossi\r\nMessage: Do you coat wheels + calipers? Mine are 20" & gloss black.\r\nThanks!\r\n',
    );
  });

  it("shortens a long message to fit the link", () => {
    const message = "Which ceramic package suits a daily driver? ".repeat(100);
    const href = contactMailto({ ...question, message });

    expect(href.length).toBeLessThanOrEqual(MAILTO_MAX_LENGTH);
    const { body } = openMailto(href);
    expect(body.endsWith(`${CUT_MARKER}\r\n`)).toBe(true);
    expect(message.startsWith(body.slice("Name: Alex Rossi\r\nMessage: ".length, body.indexOf(CUT_MARKER)))).toBe(true);
  });
});
