/**
 * About-page copy. Every claim here has to be true of the actual operation
 * (no-invention rule) and has to agree with BAY_FACTS in site.ts — an
 * outdoor detailing bay plus a small garage, never a "studio" or an indoor
 * facility. Daylight is described as the strength it is.
 */

export interface AboutPassage {
  heading: string;
  /** Rendered as separate <p> elements, in order. */
  body: string[];
  media: { alt: string; label: string };
}

export interface Standard {
  title: string;
  body: string;
}

const passages: AboutPassage[] = [
  {
    heading: "Riflessi means reflections.",
    body: [
      "It is the only test that matters here. When the work is finished, the paint should hand back a clean picture of whatever is standing in front of it — no haze softening the edges, no swirls breaking up the light.",
      "That standard is the reason this operation is shaped the way it is. Paint that reflects properly needs hours, honest light, and someone who has nowhere else to be that afternoon.",
    ],
    media: { alt: "A reflection held in freshly polished paint", label: "The standard" },
  },
  {
    heading: "A bay, not a showroom.",
    body: [
      "The setup is an outdoor detailing bay and a small garage in the New Westminster area. There is no waiting lounge and no wall of framed certificates, because none of that touches your car.",
      "Working in the open sounds like a compromise until you watch it catch things. Natural daylight is harsher than any shop lighting — it shows the swirl you would have missed and the panel you thought was finished. Work that passes outdoors passes anywhere.",
      "The garage covers what daylight cannot. Ceramic coatings cure under cover, out of the weather, before the car goes back on the road.",
    ],
    media: { alt: "The Riflessi outdoor detailing bay", label: "The bay" },
  },
  {
    heading: "The same hands, start to finish.",
    body: [
      "Drop-off, the work itself, and the walkthrough at pickup are all one person. There is no crew to hand your car down to and no shift change partway through a polish.",
      "It makes accountability simple. If something on your car was missed, there is exactly one person to ask about it, and you already met them.",
    ],
    media: { alt: "Final walkthrough with the owner at pickup", label: "One craftsman" },
  },
];

const standards: Standard[] = [
  {
    title: "Judged in daylight",
    body: "Every finish gets checked outdoors in natural light before the car is called done — the least forgiving light there is.",
  },
  {
    title: "Hands, never brushes",
    body: "A two-bucket hand wash on every vehicle. Nothing goes through a tunnel, and nothing spinning ever touches your paint.",
  },
  {
    title: "One vehicle holds the bay",
    body: "A booking reserves the bay for the whole visit. Nothing is queued behind your car, so nothing gets cut short to make room.",
  },
  {
    title: "Told before, not after",
    body: "Paint and interior get assessed with you at drop-off. If the condition changes the price or the realistic result, you hear it then — never at pickup.",
  },
];

/** Deliberately phrased as refusals — the promises are easier to trust for it. */
const refusals: string[] = [
  "Sell you paint correction the car does not need.",
  "Quote one price at drop-off and a different one at pickup.",
  "Promise that polishing will remove a scratch it cannot.",
  "Pull a second car into the bay to move your booking along faster.",
];

export function getAboutPassages(): AboutPassage[] {
  return passages;
}

export function getStandards(): Standard[] {
  return standards;
}

export function getRefusals(): string[] {
  return refusals;
}
