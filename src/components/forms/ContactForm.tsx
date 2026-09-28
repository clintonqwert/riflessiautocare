"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/lib/actions/submit-contact";
import type { ContactFormValues, FormResult } from "@/types/forms";
import { CONTACT_EMAIL } from "@/lib/content/site";
import { contactMailto } from "@/lib/mailto";
import { inputBase, inputError, labelBase, errorBanner } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { FieldError, SpamGuards } from "@/components/forms/FormParts";

/** Replaces the form once the message is in. Focus moves here so it is announced. */
function Sent() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="py-4 text-center">
      <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-medium tracking-tight text-fg focus:outline-none">
        Message sent.
      </h3>
      <p className="mt-2 text-muted">Thanks — you&apos;ll get a reply by email.</p>
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<
    FormResult<ContactFormValues> | null,
    FormData
  >(submitContact, null);

  if (state?.ok) return <Sent />;

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <SpamGuards />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="cf-name" className={labelBase}>
            Name <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Rossi"
            defaultValue={values?.name}
            className={`${inputBase} ${errors.name ? inputError : ""}`}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError id="cf-name-error" message={errors.name} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="cf-email" className={labelBase}>
            Email <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue={values?.email}
            className={`${inputBase} ${errors.email ? inputError : ""}`}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError id="cf-email-error" message={errors.email} />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className={labelBase}>
          Your question <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          placeholder="Ask about a service, your car, or how drop-off works…"
          defaultValue={values?.message}
          className={`${inputBase} min-h-[120px] resize-y ${errors.message ? inputError : ""}`}
          aria-describedby={errors.message ? "cf-message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
        />
        <FieldError id="cf-message-error" message={errors.message} />
      </div>

      {/* Only a failed hand-off sets `errors.form`, so the fallback always applies. */}
      {errors.form && (
        <div role="alert" className={errorBanner}>
          <p>{errors.form}</p>
          <p className="mt-2">
            Email it straight to{" "}
            <a
              href={contactMailto(values)}
              className="font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            instead — your question is already written out.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses({ size: "lg", className: "mt-1 w-full" })}
      >
        {isPending ? "Sending…" : "Send my question →"}
      </button>
    </form>
  );
}
