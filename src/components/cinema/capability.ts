"use client";

import { useEffect, useState } from "react";

/**
 * "cinematic" earns the WebGL stage. "static" gets the CSS fallback and never
 * downloads the 3D chunk at all — the decision gates the import, not just the
 * render, so low-powered devices pay nothing for a scene they will not see.
 */
export type StageCapability = "cinematic" | "static";

/** Below this width the sequence is a reading experience, not a scene. */
const CINEMATIC_MIN_WIDTH = 768;
const MIN_CPU_CORES = 4;
const MIN_DEVICE_MEMORY_GB = 4;

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function hasWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Deliberately conservative: anything ambiguous falls back. A missed 3D scene
 * costs polish; a janky one on a mid-range phone costs the visitor.
 */
export function detectStageCapability(): StageCapability {
  if (typeof window === "undefined") return "static";

  // Motion preference outranks every other signal.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  if (window.innerWidth < CINEMATIC_MIN_WIDTH) return "static";

  // A coarse pointer at desktop width is usually a tablet or a TV browser.
  if (window.matchMedia("(pointer: coarse)").matches) return "static";

  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return "static";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < MIN_DEVICE_MEMORY_GB) {
    return "static";
  }
  if (
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency < MIN_CPU_CORES
  ) {
    return "static";
  }

  return hasWebGl() ? "cinematic" : "static";
}

/**
 * Returns `null` until the check has run on the client. The server and the
 * first client paint both render the fallback, so there is no hydration
 * mismatch and no layout shift when the scene arrives behind it.
 */
export function useStageCapability(): StageCapability | null {
  const [capability, setCapability] = useState<StageCapability | null>(null);

  useEffect(() => {
    const decide = () => setCapability(detectStageCapability());
    decide();

    // Honour a motion-preference change without requiring a reload.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", decide);
    return () => motion.removeEventListener("change", decide);
  }, []);

  return capability;
}
