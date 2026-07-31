"use client";

import { useState } from "react";
import {
  livePoses,
  posesAsSource,
  resetPoses,
  resetStageConfig,
  setPoseValue,
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
    title: "Trim",
    note: "Everything on the car that is not paint.",
    controls: [
      { kind: "color", group: "trim", key: "glassColor", label: "Glass tint" },
      {
        kind: "range", group: "trim", key: "glassOpacity", label: "Glass opacity", min: 0, max: 1, step: 0.01,
        hint: "0 is invisible glass — the bug that lost the windshield",
      },
      { kind: "range", group: "trim", key: "glassRoughness", label: "Glass roughness", min: 0, max: 0.4, step: 0.005 },
      { kind: "color", group: "trim", key: "rimColor", label: "Rim colour" },
      { kind: "range", group: "trim", key: "rimMetalness", label: "Rim metalness", min: 0, max: 1, step: 0.01 },
      { kind: "range", group: "trim", key: "rimRoughness", label: "Rim roughness", min: 0, max: 1, step: 0.01 },
      { kind: "color", group: "trim", key: "tyreColor", label: "Tyre colour" },
      { kind: "range", group: "trim", key: "lightGlow", label: "Lamp glow", min: 0, max: 4, step: 0.05 },
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

/**
 * Per-act camera editor. This is the "scroll" surface: each act's camera
 * position, aim, exposure and finish, with a jump button so the page scrolls to
 * the act you are editing.
 */
function CameraEditor({
  onChange,
  buttonClass,
}: {
  onChange: () => void;
  buttonClass: string;
}) {
  const [act, setAct] = useState(0);
  const pose = livePoses[act];

  const jump = () => {
    document.getElementById(pose.id)?.scrollIntoView({ behavior: "smooth" });
  };

  const axis = (key: "position" | "target", i: 0 | 1 | 2, label: string) => (
    <div key={`${key}${i}`} className="mt-1.5">
      <label
        htmlFor={`tune-${key}-${i}`}
        className="flex items-baseline justify-between gap-2 text-[11px] text-muted"
      >
        <span>{label}</span>
        <span className="font-mono text-[11px] text-fg">{pose[key][i].toFixed(2)}</span>
      </label>
      <input
        id={`tune-${key}-${i}`}
        type="range"
        min={-26}
        max={26}
        step={0.05}
        value={pose[key][i]}
        onChange={(e) => {
          setPoseValue(act, key, i, Number(e.target.value));
          onChange();
        }}
        className="mt-1 w-full accent-[var(--color-accent)]"
      />
    </div>
  );

  const scalar = (key: "exposure" | "finish", label: string, max: number) => (
    <div className="mt-1.5">
      <label
        htmlFor={`tune-${key}`}
        className="flex items-baseline justify-between gap-2 text-[11px] text-muted"
      >
        <span>{label}</span>
        <span className="font-mono text-[11px] text-fg">{pose[key].toFixed(2)}</span>
      </label>
      <input
        id={`tune-${key}`}
        type="range"
        min={0}
        max={max}
        step={0.01}
        value={pose[key]}
        onChange={(e) => {
          setPoseValue(act, key, Number(e.target.value));
          onChange();
        }}
        className="mt-1 w-full accent-[var(--color-accent)]"
      />
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="font-sans text-xs font-semibold text-fg">Scroll &amp; camera</h2>
      <p className="mt-0.5 mb-2 text-[10px] leading-snug text-muted">
        Pick an act, jump to it, then frame it.
      </p>

      <div className="flex flex-wrap gap-1">
        {livePoses.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setAct(i)}
            aria-pressed={i === act}
            className={`rounded-sm border px-1.5 py-0.5 text-[10px] transition-colors ${
              i === act
                ? "border-accent bg-accent text-accent-fg"
                : "border-line-strong bg-overlay text-muted hover:border-accent"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button type="button" onClick={jump} className={`${buttonClass} ml-auto`}>
          Jump
        </button>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-accent">{pose.id}</p>

      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted">Position</p>
      {axis("position", 0, "X · left / right")}
      {axis("position", 1, "Y · height")}
      {axis("position", 2, "Z · distance")}

      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted">Aim</p>
      {axis("target", 0, "X")}
      {axis("target", 1, "Y")}
      {axis("target", 2, "Z")}

      {scalar("exposure", "Exposure", 2.5)}
      {scalar("finish", "Coating", 1)}
    </section>
  );
}

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
    // Both halves: the look lives in stage-config.ts, the choreography in
    // cinema.ts, and a design session almost always touches each.
    await navigator.clipboard.writeText(
      `${stageConfigAsSource()}\n\n/* --- camera poses, for src/lib/content/cinema.ts --- */\n${posesAsSource()}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => {
    resetStageConfig();
    resetPoses();
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
      // Lenis hijacks wheel events for the whole page, which otherwise swallows
      // scrolling inside this panel and moves the sequence instead. This is its
      // documented opt-out.
      data-lenis-prevent
      className="fixed bottom-4 right-4 z-[200] max-h-[88vh] w-[300px] overflow-y-auto overscroll-contain rounded-md border border-line-strong bg-surface/95 p-3 text-fg shadow-lg backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Stage tuner · dev
        </p>
        <button type="button" onClick={() => setOpen(false)} className={button}>
          Hide
        </button>
      </div>

      <CameraEditor onChange={() => forceRender((n) => n + 1)} buttonClass={button} />

      {/*
        Collapsible, because the full panel is nearly three screens tall and a
        design session lives in one or two groups at a time. <details> rather
        than state: native, keyboard accessible, and it remembers nothing —
        which is right, since the useful default is everything open.
      */}
      {SECTIONS.map((section) => (
        <details key={section.title} open className="group mb-3">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm py-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <h2 className="font-sans text-xs font-semibold text-fg">
              {section.title}
            </h2>
            <span
              aria-hidden
              className="text-[10px] text-muted transition-transform group-open:rotate-90"
            >
              ▸
            </span>
          </summary>
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
        </details>
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
