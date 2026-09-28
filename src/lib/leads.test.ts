import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverLead, timingSpamReason, type Lead } from "@/lib/leads";
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

describe("timingSpamReason", () => {
  it.each([
    [null, "no-timestamp"],
    ["", "no-timestamp"],
    ["abc", "bad-timestamp"],
    ["0", "bad-timestamp"],
  ])("flags the stamp %j as %s", (stamp, reason) => {
    expect(timingSpamReason(stamp)).toBe(reason);
  });

  it("flags a submit faster than a person could fill the form", () => {
    expect(timingSpamReason(String(Date.now() - 1000))).toBe("too-fast");
  });

  it("passes a human-paced submit", () => {
    expect(timingSpamReason(String(Date.now() - 5000))).toBeNull();
  });
});
