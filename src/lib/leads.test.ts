import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverLead, submissionTiming, UNVERIFIED_NOTE, type Lead } from "@/lib/leads";
import { SERVICE_LABELS, VEHICLE_SIZE_LABELS } from "@/types/content";

const booking: Lead = {
  kind: "booking",
  name: "Alex Rossi",
  email: "alex@example.com",
  phone: "+1 604 555 0199",
  vehicle: "2021 Mazda CX-5",
  service: "full-detail",
  vehicleSize: "suv-crossover",
  preferredDate: "2026-10-15",
  notes: "Keys in the lockbox.",
};

const question: Lead = {
  kind: "contact",
  name: "Alex Rossi",
  email: "alex@example.com",
  message: "Do you coat wheels and calipers?",
};

const fetchMock = vi.fn<typeof fetch>();

/** The one request deliverLead made. */
function sent() {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  return { url, headers: init?.headers, body: JSON.parse(String(init?.body)) };
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("BOOKING_WEBHOOK_URL", "");
  vi.stubEnv("CONTACT_WEBHOOK_URL", "");
  vi.stubEnv("VERCEL_ENV", "");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("deliverLead", () => {
  it("posts a booking to the booking webhook, shaped for Formspree", async () => {
    vi.stubEnv("BOOKING_WEBHOOK_URL", "https://formspree.test/booking");

    expect(await deliverLead(booking)).toBe(true);
    const { url, headers, body } = sent();
    expect(url).toBe("https://formspree.test/booking");
    expect(headers).toMatchObject({ Accept: "application/json" });
    expect(body).toMatchObject({
      subject: "Booking request — Alex Rossi",
      email: "alex@example.com",
      service: SERVICE_LABELS["full-detail"],
      vehicleSize: VEHICLE_SIZE_LABELS["suv-crossover"],
      notes: "Keys in the lockbox.",
      source: "booking-form",
    });
    expect(body).not.toHaveProperty("kind");
  });

  it("posts a question to the contact webhook", async () => {
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://formspree.test/contact");

    expect(await deliverLead(question)).toBe(true);
    const { url, body } = sent();
    expect(url).toBe("https://formspree.test/contact");
    expect(body).toMatchObject({
      subject: "Question — Alex Rossi",
      email: "alex@example.com",
      message: "Do you coat wheels and calipers?",
      source: "contact-form",
    });
  });

  it("delivers an unverified lead flagged, not dropped", async () => {
    vi.stubEnv("BOOKING_WEBHOOK_URL", "https://formspree.test/booking");

    expect(await deliverLead(booking, { unverified: true })).toBe(true);
    const { body } = sent();
    expect(body.subject).toBe("[No timing check] Booking request — Alex Rossi");
    expect(body.timingCheck).toBe(UNVERIFIED_NOTE);
    expect(Object.keys(body).slice(0, 2)).toEqual(["subject", "timingCheck"]);
  });

  it("leaves a verified lead unflagged", async () => {
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://formspree.test/contact");

    await deliverLead(question);
    const { body } = sent();
    expect(body.subject).toBe("Question — Alex Rossi");
    expect(body).not.toHaveProperty("timingCheck");
  });

  it("keeps the flag's wording clear of spam-filter trigger words", () => {
    expect(UNVERIFIED_NOTE).not.toMatch(/spam|bot/i);
  });

  it("reports a rejected submission as undelivered, without retrying", async () => {
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://formspree.test/contact");
    fetchMock.mockResolvedValue(new Response('{"error":"Form not found"}', { status: 404 }));

    expect(await deliverLead(question)).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["the live Vercel site", { VERCEL_ENV: "production", NODE_ENV: "production" }],
    ["a production server off Vercel", { VERCEL_ENV: "", NODE_ENV: "production" }],
  ])("fails loud on %s when the webhook is missing", async (_, env) => {
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);

    expect(await deliverLead(booking)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["a Vercel preview", { VERCEL_ENV: "preview", NODE_ENV: "production" }],
    ["local dev", { VERCEL_ENV: "", NODE_ENV: "development" }],
  ])("logs instead of sending on %s when the webhook is missing", async (_, env) => {
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);

    expect(await deliverLead(booking)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("submissionTiming", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["missing (JavaScript off, or sent before the scripts loaded)", null],
    ["empty", ""],
    ["not a number", "abc"],
    ["negative", "-5"],
  ])("treats a time on page that is %s as unverified", (_, value) => {
    expect(submissionTiming(value)).toBe("unverified");
  });

  it.each([["0"], ["2999"]])("flags %s ms on the page as too fast for a person", (value) => {
    expect(submissionTiming(value)).toBe("too-fast");
  });

  it.each([["3000"], ["62000"]])("passes %s ms on the page", (value) => {
    expect(submissionTiming(value)).toBe("human");
  });

  it("never consults the server's clock, so a visitor's clock skew can't matter", () => {
    // The old check subtracted the visitor's clock from the server's, so a
    // clock 60 s ahead turned a 62 s fill into a 2 s one and dropped the
    // lead. The duration is now the page's own, whatever time it is here.
    vi.useFakeTimers();
    for (const now of ["2000-01-01", "2099-12-31"]) {
      vi.setSystemTime(new Date(now));
      expect(submissionTiming("62000")).toBe("human");
      expect(submissionTiming("1000")).toBe("too-fast");
    }
  });
});
