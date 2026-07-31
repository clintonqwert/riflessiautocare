/**
 * The homepage's scroll-driven sequence: seven acts, each pairing its copy
 * with a camera pose and a material state.
 *
 * This file is the whole adaptation surface of the cinematic template. To
 * re-skin it for a PPF installer, tint shop, or wrap studio, rewrite the acts
 * here and swap the palette in globals.css — no component changes required.
 * See docs/maintenance/FRAMEWORK.md.
 *
 * Vocabulary rule (site.ts): the lighting rig is showroom-grade, but the copy
 * never claims a showroom or an indoor facility. The setup is an outdoor bay
 * plus a small garage, and daylight is the strength.
 */

import { BOOKING_RESPONSE_PROMISE } from "@/lib/content/site";

/** Where the camera sits, and what the surface looks like, for one act. */
export interface CinemaPose {
  /** Camera position in scene units. */
  position: readonly [number, number, number];
  /** The point the camera is aimed at. */
  target: readonly [number, number, number];
  /** Key-light multiplier — act 1 opens near darkness, act 6 is brightest. */
  exposure: number;
  /**
   * The surface story: 0 is bare, freshly corrected paint (softer, more
   * diffuse), 1 is a cured ceramic coating (tight, mirror-like clearcoat).
   */
  finish: number;
}

export interface CinemaAct {
  /** Stable id — also the section's DOM id, so acts are linkable. */
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  pose: CinemaPose;
}

const acts: CinemaAct[] = [
  {
    id: "arrival",
    eyebrow: "Detailing by Appointment · Metro Vancouver",
    heading: "One vehicle. Undivided attention.",
    body: "Riflessi is a private, appointment-only detailing service. Drop off your car and it gets the bay to itself and one craftsman's full attention — until the finish is right.",
    pose: {
      position: [0.4, 0.5, 11.5],
      target: [0, 0, 0],
      exposure: 0.16,
      finish: 0.3,
    },
  },
  {
    id: "reveal",
    eyebrow: "Il Riflesso",
    heading: "The finish is the whole argument.",
    body: "Riflessi is Italian for reflections. When the work is done, paint should hand back a clean picture of whatever stands in front of it — no haze softening the edges, no swirls breaking up the light.",
    pose: {
      position: [4.7, 1.9, 5.3],
      target: [0, 0.15, 0],
      exposure: 1,
      finish: 0.48,
    },
  },
  {
    id: "around",
    eyebrow: "Ogni Angolo",
    heading: "Every angle gets the same hour.",
    body: "Paint is judged from more than one position, because that is how you will see the car. What looks finished head-on can still show haze at a rake, so the walk around happens before the car is called done — not after you have driven it home.",
    pose: {
      position: [-5.9, 1.15, 3.1],
      target: [0, 0.2, 0],
      exposure: 0.92,
      finish: 0.55,
    },
  },
  {
    id: "craft",
    eyebrow: "La Mano",
    heading: "Correction happens by hand, one panel at a time.",
    body: "Two-bucket wash, clay bar decontamination, then machine polish worked panel by panel. Nothing spinning touches your paint on an automated arm, and nothing is hurried along to free the bay for the next car.",
    // Raking across the rear haunch — the widest point of the body, where a
    // light strip bends hardest and swirls show first. The closest pose in the
    // sequence, so it is the first to clip if the body is widened. Re-run the
    // camera-path check after changing `form` in stage-config.ts.
    pose: {
      position: [3.15, 0.7, 3.35],
      target: [1.85, 0.04, 0.9],
      exposure: 1.18,
      finish: 0.62,
    },
  },
  {
    id: "services",
    eyebrow: "Servizi",
    heading: "Four services. Each done completely.",
    body: "No fifteen-item menu and no upsell ladder — four ways to bring a car back, each one taken start to finish inside a single booking.",
    pose: {
      position: [2.3, 3.5, 7.4],
      target: [0, -0.4, 0],
      exposure: 0.58,
      finish: 0.68,
    },
  },
  {
    id: "finishes",
    eyebrow: "La Protezione",
    heading: "Then the gloss gets sealed in.",
    body: "Polishing restores the reflection; protection is what keeps it. A sealant carries a car through months of BC weather, and a properly prepped ceramic coating through years — cured under cover before the car goes back on the road.",
    pose: {
      position: [-3.0, 1.0, 3.9],
      target: [0, 0.08, 0],
      exposure: 1.3,
      finish: 1,
    },
  },
  {
    id: "invitation",
    eyebrow: "Prenota",
    heading: "Bring it by. See it in daylight.",
    body: `One vehicle holds the bay for the whole visit. Send the booking form with your car and a preferred day, and you'll get a personal reply ${BOOKING_RESPONSE_PROMISE}.`,
    pose: {
      position: [0.7, 2.4, 8.6],
      target: [0, 0, 0],
      exposure: 0.88,
      finish: 1,
    },
  },
];

export function getCinemaActs(): CinemaAct[] {
  return acts;
}

/** The opening pose, used as the camera's initial state before scroll begins. */
export function getOpeningPose(): CinemaPose {
  return acts[0].pose;
}
