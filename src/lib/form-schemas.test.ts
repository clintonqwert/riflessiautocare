import { describe, expect, it } from "vitest";
import { bookingSchema, contactSchema } from "@/lib/form-schemas";
import { FREE_TEXT_MAX_LENGTH } from "@/types/forms";

const booking = {
  name: "Alex Rossi",
  email: "alex@example.com",
  phone: "+1 604 555 0199",
  vehicle: "2021 Mazda CX-5",
  service: "full-detail",
  vehicleSize: "suv-crossover",
  preferredDate: "2026-10-15",
};

const question = { name: "Alex Rossi", email: "alex@example.com" };

/** Text as a browser submits it from a textarea: every line break is CRLF. */
const asSubmitted = (lines: number, lineLength: number) =>
  Array.from({ length: lines }, () => "x".repeat(lineLength)).join("\r\n");

describe("free-text limit", () => {
  // 25 lines of 79 characters: 1,999 characters as the visitor counts them,
  // but 2,023 raw, because each of the 24 line breaks arrives as two characters.
  const underLimit = asSubmitted(25, 79);

  it("counts each submitted line break once", () => {
    expect(underLimit.length).toBeGreaterThan(FREE_TEXT_MAX_LENGTH);
    expect(contactSchema.safeParse({ ...question, message: underLimit }).success).toBe(true);
    expect(bookingSchema.safeParse({ ...booking, notes: underLimit }).success).toBe(true);
  });

  it("delivers line breaks as plain newlines", () => {
    const parsed = contactSchema.parse({ ...question, message: "First line\r\nsecond line" });
    expect(parsed.message).toBe("First line\nsecond line");
  });

  it("rejects text over the limit, with the matching message", () => {
    const tooLong = "x".repeat(FREE_TEXT_MAX_LENGTH + 1);
    const contact = contactSchema.safeParse({ ...question, message: tooLong });
    const notes = bookingSchema.safeParse({ ...booking, notes: tooLong });

    expect(contact.error?.issues[0].message).toMatch(/question to 2,000 characters/);
    expect(notes.error?.issues[0].message).toMatch(/notes to 2,000 characters/);
  });

  it("still asks for more than a few words in a question", () => {
    const result = contactSchema.safeParse({ ...question, message: "  hi  " });
    expect(result.error?.issues[0].message).toMatch(/a little more/);
  });

  it("keeps booking notes optional", () => {
    expect(bookingSchema.safeParse(booking).success).toBe(true);
  });
});
