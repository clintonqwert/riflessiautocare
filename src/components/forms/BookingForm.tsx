"use client";

import { useActionState } from "react";
import { submitBooking } from "@/lib/actions/submit-booking";
import { FREE_TEXT_MAX_LABEL, SERVICE_OPTIONS, VEHICLE_SIZES } from "@/types/forms";
import type { BookingFormValues, FormResult } from "@/types/forms";
import { SERVICE_LABELS, VEHICLE_SIZE_LABELS } from "@/types/content";
import { CONTACT_EMAIL } from "@/lib/content/site";
import { bookingMailto } from "@/lib/mailto";
import { inputBase, inputError, labelBase, errorBanner } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { FieldError, SpamGuards } from "@/components/forms/FormParts";

export function BookingForm() {
  const [state, formAction, isPending] = useActionState<FormResult<BookingFormValues> | null, FormData>(
    submitBooking,
    null,
  );

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <SpamGuards />

      {/* Name */}
      <div>
        <label htmlFor="bf-name" className={labelBase}>
          Full name <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id="bf-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Alex Rossi"
          defaultValue={values?.name}
          className={`${inputBase} ${errors.name ? inputError : ""}`}
          aria-describedby={errors.name ? "bf-name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError id="bf-name-error" message={errors.name} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Email */}
        <div>
          <label htmlFor="bf-email" className={labelBase}>
            Email <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="bf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="alex@email.com"
            defaultValue={values?.email}
            className={`${inputBase} ${errors.email ? inputError : ""}`}
            aria-describedby={errors.email ? "bf-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError id="bf-email-error" message={errors.email} />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="bf-phone" className={labelBase}>
            Phone <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="bf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="604 555 0123"
            defaultValue={values?.phone}
            className={`${inputBase} ${errors.phone ? inputError : ""}`}
            aria-describedby={errors.phone ? "bf-phone-error" : undefined}
            aria-invalid={Boolean(errors.phone)}
          />
          <FieldError id="bf-phone-error" message={errors.phone} />
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <label htmlFor="bf-vehicle" className={labelBase}>
          Vehicle <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id="bf-vehicle"
          name="vehicle"
          type="text"
          required
          placeholder="2021 Mazda CX-5"
          defaultValue={values?.vehicle}
          className={`${inputBase} ${errors.vehicle ? inputError : ""}`}
          aria-describedby={errors.vehicle ? "bf-vehicle-error" : undefined}
          aria-invalid={Boolean(errors.vehicle)}
        />
        <FieldError id="bf-vehicle-error" message={errors.vehicle} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Service */}
        <div>
          <label htmlFor="bf-service" className={labelBase}>
            Service <span className="text-danger" aria-hidden="true">*</span>
          </label>
          {/*
            React resets the form after each submit, and a <select> only takes
            its defaultValue when it mounts. Keying on the submitted value
            remounts it with the visitor's choice, so an error elsewhere
            doesn't drop it back to the placeholder.
          */}
          <select
            key={values?.service ?? ""}
            id="bf-service"
            name="service"
            required
            defaultValue={values?.service ?? ""}
            className={`${inputBase} ${errors.service ? inputError : ""}`}
            aria-describedby={errors.service ? "bf-service-error" : undefined}
            aria-invalid={Boolean(errors.service)}
          >
            <option value="" disabled>
              Choose a service…
            </option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {SERVICE_LABELS[opt]}
              </option>
            ))}
          </select>
          <FieldError id="bf-service-error" message={errors.service} />
        </div>

        {/* Vehicle size */}
        <div>
          <label htmlFor="bf-size" className={labelBase}>
            Vehicle size <span className="text-danger" aria-hidden="true">*</span>
          </label>
          {/* Keyed for the same reason as the service select. */}
          <select
            key={values?.vehicleSize ?? ""}
            id="bf-size"
            name="vehicleSize"
            required
            defaultValue={values?.vehicleSize ?? ""}
            className={`${inputBase} ${errors.vehicleSize ? inputError : ""}`}
            aria-describedby={errors.vehicleSize ? "bf-size-error" : undefined}
            aria-invalid={Boolean(errors.vehicleSize)}
          >
            <option value="" disabled>
              Choose a size…
            </option>
            {VEHICLE_SIZES.map((opt) => (
              <option key={opt} value={opt}>
                {VEHICLE_SIZE_LABELS[opt]}
              </option>
            ))}
          </select>
          <FieldError id="bf-size-error" message={errors.vehicleSize} />
        </div>
      </div>

      {/* Preferred date */}
      <div>
        <label htmlFor="bf-date" className={labelBase}>
          Preferred drop-off day <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id="bf-date"
          name="preferredDate"
          type="date"
          required
          defaultValue={values?.preferredDate}
          className={`${inputBase} ${errors.preferredDate ? inputError : ""}`}
          aria-describedby={errors.preferredDate ? "bf-date-error" : undefined}
          aria-invalid={Boolean(errors.preferredDate)}
        />
        <FieldError id="bf-date-error" message={errors.preferredDate} />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="bf-notes" className={labelBase}>
          Anything I should know? <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="bf-notes"
          name="notes"
          rows={4}
          placeholder="Pet hair in the back, water spots on the hood, a stain on the passenger seat…"
          defaultValue={values?.notes}
          className={`${inputBase} min-h-[100px] resize-y ${errors.notes ? inputError : ""}`}
          aria-describedby={errors.notes ? "bf-notes-hint bf-notes-error" : "bf-notes-hint"}
          aria-invalid={Boolean(errors.notes)}
        />
        <p id="bf-notes-hint" className="mt-1.5 text-xs text-muted">
          Up to {FREE_TEXT_MAX_LABEL} characters.
        </p>
        <FieldError id="bf-notes-error" message={errors.notes} />
      </div>

      {/* Only a failed hand-off sets `errors.form`, so the fallback always applies. */}
      {errors.form && (
        <div role="alert" className={errorBanner}>
          <p>{errors.form}</p>
          <p className="mt-2">
            Send these details straight to{" "}
            <a
              href={bookingMailto(values)}
              className="font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and your request still gets seen — your answers are already filled in.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses({ size: "lg", className: "mt-1 w-full" })}
      >
        {isPending ? "Sending…" : "Request my booking →"}
      </button>

      <p className="text-center text-xs text-muted">
        You&apos;ll get a personal reply within one business day to confirm your slot.
      </p>
    </form>
  );
}
