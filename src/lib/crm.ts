import "server-only";

/**
 * CRM webhook client (handoff doc §9).
 *
 * Phase 1: direct POST to a CRM webhook with retry.
 * Phase 3: this becomes a POST to API Gateway → SQS (§13.3) — callers
 * (the Server Actions) keep the same interface.
 */

const MAX_ATTEMPTS = 2;

export async function sendToCrm(
  webhookUrl: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
      console.error(
        `[crm] webhook responded ${res.status} (attempt ${attempt}/${MAX_ATTEMPTS})`,
      );
    } catch (error) {
      console.error(
        `[crm] webhook request failed (attempt ${attempt}/${MAX_ATTEMPTS})`,
        error,
      );
    }
  }
  // TODO(phase 1): queue fallback email on total failure — never lose a lead.
  return false;
}
