"use client";

import { useEffect, useRef } from "react";
import { errorText } from "@/components/ui/field";
import { TIME_ON_PAGE_FIELD } from "@/types/forms";

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
 * The spam checks src/lib/leads.ts reads: a honeypot bots fill in, and how
 * long the page had been open when the form was sent.
 *
 * That time is `performance.now()`: the visitor's own steady clock, counted
 * from when the page began loading. Only one clock is involved, so a
 * visitor's clock running fast or slow can't make a real lead look like a
 * bot. Counting from page load rather than hydration can only overstate the
 * time, so typing before the scripts arrive is never mistaken for a bot. It
 * is added in the form's `formdata` event, which fires when React builds the
 * action's form data and on a plain HTML submit alike.
 */
export function SpamGuards() {
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = honeypotRef.current?.form;
    if (!form) return;
    const addTimeOnPage = (event: FormDataEvent) => {
      event.formData.set(TIME_ON_PAGE_FIELD, String(Math.round(performance.now())));
    };
    form.addEventListener("formdata", addTimeOnPage);
    return () => form.removeEventListener("formdata", addTimeOnPage);
  }, []);

  return (
    <div aria-hidden="true" className="hidden" tabIndex={-1}>
      <input ref={honeypotRef} name="website" type="text" autoComplete="off" tabIndex={-1} />
    </div>
  );
}
