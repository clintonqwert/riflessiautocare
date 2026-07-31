"use client";

import { useState } from "react";
import {
  resetStageConfig,
  setStageValue,
  stageConfig,
  stageConfigAsSource,
  type StageConfig,
} from "./stage-config";

/**
 * Development-only control panel for the homepage stage.
 *
 * Never reaches production: `CinematicSequence` only imports this module
 * behind a `process.env.NODE_ENV === "development"` check, which the bundler
 * resolves statically and eliminates.
 *
 * Workflow: drag until it looks right, press "Copy values", paste the result
 * over `STAGE_DEFAULTS` in stage-config.ts.
 */

type Group = keyof StageConfig;

interface RangeControl {
  kind: "range";
  group: Group;
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  hint?: string;
}

interface ColorControl {
  kind: "color";
  group: Group;
  key: string;
  label: string;
}

type Control = RangeControl | ColorControl;

const SECTIONS: { title: string; note: string; controls: Control[] }[] = [
  {
    title: "Body",
    note: "Shape comes from the model; only its scale is tunable here.",
    controls: [
      { kind: "range", group: "form", key: "length", label: "Length", min: 3, max: 12, step: 0.05 },
    ],
  },
  {
    title: "Material",
    note: "Applies on the next frame, no rebuild.",
    controls: [
      { kind: "color", group: "material", key: "color", label: "Paint colour" },
      { kind: "range", group: "material", key: "metalness", label: "Metalness", min: 0, max: 1, step: 0.01 },
      { kind: "range", group: "material", key: "roughnessBare", label: "Roughness (bare)", min: 0, max: 1, step: 0.01 },
      { kind: "range", group: "material", key: "roughnessCoated", label: "Roughness (coated)", min: 0, max: 0.4, step: 0.005 },
      {
        kind: "range", group: "material", key: "envIntensityCoated", label: "Gloss", min: 0.2, max: 5, step: 0.05,
        hint: "Reflection strength once coated — the main shine dial",
      },
    ],
  },
  {
    title: "Light",
    note: "Re-bakes the environment map on each change.",
    controls: [
      { kind: "range", group: "light", key: "key", label: "Key (overhead)", min: 0, max: 20, step: 0.1 },
      { kind: "range", group: "light", key: "sweepLeft", label: "Sweep left", min: 0, max: 15, step: 0.1 },
      { kind: "range", group: "light", key: "sweepRight", label: "Sweep right", min: 0, max: 15, step: 0.1 },
      { kind: "range", group: "light", key: "bronzeRim", label: "Bronze rim", min: 0, max: 15, step: 0.1 },
      {
        kind: "range", group: "light", key: "fill", label: "Fill", min: 0, max: 4, step: 0.05,
        hint: "Raising this flattens everything — keep it low for contrast",
      },
      { kind: "color", group: "light", key: "keyColor", label: "Key colour" },
      { kind: "color", group: "light", key: "bronzeColor", label: "Rim colour" },
    ],
  },
  {
    title: "Camera & backdrop",
    note: "",
    controls: [
      {
        kind: "range", group: "camera", key: "fov", label: "Field of view", min: 18, max: 70, step: 1,
        hint: "Low = telephoto and flat, high = wide and dramatic",
      },
      {
        kind: "range", group: "backdrop", key: "lift", label: "Backdrop lift", min: 40, max: 100, step: 1,
        hint: "Lower = brighter pool behind the form (more separation)",
      },
    ],
  },
];

function readValue(group: Group, key: string): number | string {
  return (stageConfig[group] as Record<string, number | string>)[key];
}

export function StageTuner() {
  const [open, setOpen] = useState(true);
  const [, forceRender] = useState(0);
  const [copied, setCopied] = useState(false);

  const update = (group: Group, key: string, value: number | string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setStageValue(group as any, key as any, value as any);
    if (group === "backdrop") {
      document.documentElement.style.setProperty(
        "--stage-backdrop-lift",
        `${value}%`,
      );
    }
    forceRender((n) => n + 1);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(stageConfigAsSource());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => {
    resetStageConfig();
    document.documentElement.style.removeProperty("--stage-backdrop-lift");
    forceRender((n) => n + 1);
  };

  const button =
    "rounded-sm border border-line-strong bg-overlay px-2.5 py-1 text-[11px] font-medium text-fg transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 z-[200] ${button}`}
      >
        Stage tuner
      </button>
    );
  }

  return (
    <aside
      aria-label="Stage tuner (development only)"
      className="fixed bottom-4 right-4 z-[200] max-h-[85vh] w-[290px] overflow-y-auto rounded-md border border-line-strong bg-surface/95 p-3 text-fg shadow-lg backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Stage tuner · dev
        </p>
        <button type="button" onClick={() => setOpen(false)} className={button}>
          Hide
        </button>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-4">
          <h2 className="font-sans text-xs font-semibold text-fg">
            {section.title}
          </h2>
          {section.note && (
            <p className="mt-0.5 mb-2 text-[10px] leading-snug text-muted">
              {section.note}
            </p>
          )}

          {section.controls.map((control) => {
            const id = `tune-${control.group}-${control.key}`;
            const value = readValue(control.group, control.key);

            return (
              <div key={id} className="mt-2">
                <label
                  htmlFor={id}
                  className="flex items-baseline justify-between gap-2 text-[11px] text-muted"
                >
                  <span>{control.label}</span>
                  <span className="font-mono text-[11px] text-fg">
                    {typeof value === "number" ? value.toFixed(3).replace(/\.?0+$/, "") : value}
                  </span>
                </label>

                {control.kind === "range" ? (
                  <input
                    id={id}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={Number(value)}
                    onChange={(e) =>
                      update(control.group, control.key, Number(e.target.value))
                    }
                    className="mt-1 w-full accent-[var(--color-accent)]"
                  />
                ) : (
                  <input
                    id={id}
                    type="color"
                    value={String(value)}
                    onChange={(e) =>
                      update(control.group, control.key, e.target.value)
                    }
                    className="mt-1 h-7 w-full cursor-pointer rounded-sm border border-line bg-transparent"
                  />
                )}

                {"hint" in control && control.hint && (
                  <p className="mt-0.5 text-[10px] leading-snug text-muted/80">
                    {control.hint}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-surface/95 pt-2">
        <button type="button" onClick={copy} className={`${button} flex-1`}>
          {copied ? "Copied ✓" : "Copy values"}
        </button>
        <button type="button" onClick={reset} className={button}>
          Reset
        </button>
      </div>
    </aside>
  );
}
