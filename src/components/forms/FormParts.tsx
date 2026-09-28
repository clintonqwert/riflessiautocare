"use client";

import { useEffect, useRef } from "react";
import { errorText } from "@/components/ui/field";

/** Pieces every lead form shares. */

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={errorText}>
      {message}
    </p>
  );
}

/**
 * The hidden fields src/lib/leads.ts checks: a honeypot bots fill in, and a
 * time-to-submit stamp written on hydration.
 */
export function SpamGuards() {
  const startedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedAtRef.current) {
      startedAtRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <>
      {/* Spam: honeypot */}
      <div aria-hidden="true" className="hidden" tabIndex={-1}>
        <input name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>
      {/* Spam: time-to-submit */}
      <input ref={startedAtRef} type="hidden" name="startedAt" />
    </>
  );
}
