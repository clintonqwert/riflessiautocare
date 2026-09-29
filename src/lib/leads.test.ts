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
    expect(body.subject).toBe("[Unverified] Booking request — Alex Rossi");
    expect(body.spamCheck).toBe(UNVERIFIED_NOTE);
    expect(Object.keys(body).slice(0, 2)).toEqual(["subject", "spamCheck"]);
  });

  it("leaves a verified lead unflagged", async () => {
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://formspree.test/contact");

    await deliverLead(question);
    const { body } = sent();
    expect(body.subject).toBe("Question — Alex Rossi");
    expect(body).not.toHaveProperty("spamCheck");
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
  it.each([
    ["missing (JavaScript off, or sent before the page loaded)", null],
    ["empty", ""],
    ["not a number", "abc"],
    ["zero", "0"],
    ["from a clock running ahead of the server's", String(Date.now() + 60_000)],
  ])("treats a stamp that is %s as unverified", (_, stamp) => {
    expect(submissionTiming(stamp)).toBe("unverified");
  });

  it("flags a submit faster than a person could fill the form", () => {
    expect(submissionTiming(String(Date.now() - 1000))).toBe("too-fast");
  });

  it("passes a human-paced submit", () => {
    expect(submissionTiming(String(Date.now() - 5000))).toBe("human");
  });
});
