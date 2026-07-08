import type { DetailService, ServiceSlug } from "@/types/content";

const services: DetailService[] = [
  {
    slug: "interior-detailing",
    name: "Interior Detail",
    title: "Interior Car Detailing in Metro Vancouver — Riflessi Auto Care",
    description:
      "Deep interior detailing at a private drop-off studio in Metro Vancouver. Steam, extraction, leather care — one vehicle at a time.",
    excerpt: "Every surface inside the cabin, reset to clean.",
    outcome:
      "Step into a cabin that feels like delivery day — deep-cleaned, conditioned, and free of the life that accumulates in a daily driver.",
    primaryKeyword: "interior car detailing",
    benefits: [
      "Steam and hot-water extraction, not just a vacuum pass",
      "Leather cleaned and conditioned so it lasts, not just shines",
      "Indoor studio: the interior dries properly before pickup",
    ],
    included: [
      "Full vacuum including seat rails, vents, and trunk",
      "Steam cleaning of touchpoints, vents, and crevices",
      "Carpet and upholstery shampoo with hot-water extraction",
      "Leather cleaning and conditioning",
      "Interior glass and mirror polish",
      "Door jambs and trim dressed with a natural finish",
    ],
    pairsWith: ["exterior-detailing", "full-detail"],
    pageFaq: [
      {
        question: "How long does an interior detail take?",
        answer:
          "Most interiors take three to five hours depending on size and condition. Because the studio takes one vehicle at a time, your car isn't rushed to make room for the next one — it's ready when it's right.",
      },
      {
        question: "Can you remove pet hair and odors?",
        answer:
          "Yes — pet hair removal and odor treatment are available as add-ons. Heavy pet hair takes real time to do properly, which is why it's priced separately rather than skipped.",
      },
      {
        question: "Will my seats be wet at pickup?",
        answer:
          "No. Extraction pulls most of the moisture out, and the vehicle dries indoors in the studio before you pick it up.",
      },
    ],
  },
  {
    slug: "exterior-detailing",
    name: "Exterior Detail",
    title: "Exterior Car Detailing in Metro Vancouver — Riflessi Auto Care",
    description:
      "Hand wash, clay bar, machine polish, and paint protection at a private drop-off studio in Metro Vancouver.",
    excerpt: "Paint decontaminated, polished, and protected by hand.",
    outcome:
      "Paint that reflects like glass — washed, decontaminated, and machine-polished under proper lighting, never run through a tunnel.",
    primaryKeyword: "exterior car detailing",
    benefits: [
      "Two-bucket hand wash — no brushes, no swirl-inducing shortcuts",
      "Clay bar decontamination before any polish touches the paint",
      "Finished indoors under inspection lighting, not in a driveway",
    ],
    included: [
      "Pre-rinse and foam bath, two-bucket hand wash",
      "Clay bar decontamination",
      "Machine polish to lift light swirls and restore gloss",
      "Paint sealant or carnauba wax protection",
      "Wheels deep-cleaned, tires dressed",
      "Exterior glass polished and water-repellent treated",
    ],
    pairsWith: ["interior-detailing", "ceramic-coating"],
    pageFaq: [
      {
        question: "Will polishing remove scratches?",
        answer:
          "Machine polishing removes light swirl marks and restores gloss. Deeper scratches that catch a fingernail need paint correction beyond a standard exterior detail — I'll assess your paint at drop-off and tell you honestly what polishing will and won't fix.",
      },
      {
        question: "Why is drop-off better than a mobile wash for exterior work?",
        answer:
          "Polishing outdoors means dust settling on the panel while you work and sun flashing the products. In the studio the light is controlled, the panel is clean, and the finish can be inspected properly before the car leaves.",
      },
      {
        question: "How long does the protection last?",
        answer:
          "A quality sealant typically protects for several months of BC weather. If you want protection measured in years, that's what ceramic coating is for.",
      },
    ],
  },
  {
    slug: "full-detail",
    name: "Signature Full Detail",
    title: "Full Car Detailing in Metro Vancouver — Riflessi Auto Care",
    description:
      "The complete Riflessi treatment: full interior and exterior detail in one studio visit. Drop off in the morning, drive home reset.",
    excerpt: "The complete treatment — inside and out, in one visit.",
    outcome:
      "One drop-off, everything done: the full interior reset and the full exterior treatment, sequenced properly so neither compromises the other.",
    primaryKeyword: "full car detail",
    benefits: [
      "Everything in the interior and exterior details, one booking",
      "Sequenced right: interior extraction first, paint finished last",
      "The best value per hour of work on the menu",
    ],
    included: [
      "Complete interior detail (see Interior Detail)",
      "Complete exterior detail (see Exterior Detail)",
      "Engine bay wipe-down on request",
      "Final walkthrough with you at pickup",
    ],
    pairsWith: ["ceramic-coating"],
    pageFaq: [
      {
        question: "Is the Signature Full Detail a full day?",
        answer:
          "Usually. Most full details take six to eight hours, so morning drop-off and end-of-day pickup is the normal rhythm. You'll get a message when the car is ready.",
      },
      {
        question: "Why book this instead of separate interior and exterior visits?",
        answer:
          "One visit costs less than two separate bookings, and the work sequences better — soaking and extraction happen while exterior products cure, and the final inspection covers the whole car at once.",
      },
    ],
  },
  {
    slug: "ceramic-coating",
    name: "Ceramic Coating",
    title: "Ceramic Coating in Metro Vancouver — Riflessi Auto Care",
    description:
      "Professional ceramic coating with full paint prep at a private Metro Vancouver studio. Years of protection, applied without shortcuts.",
    excerpt: "Years of protection, bonded to properly prepped paint.",
    outcome:
      "Protection measured in years, not months — a ceramic layer bonded to paint that was decontaminated and polished first, because coating over defects just seals them in.",
    primaryKeyword: "ceramic coating",
    benefits: [
      "Full decontamination and machine polish before coating — always",
      "Applied and cured indoors, away from dust and weather",
      "Water and grime rinse off instead of bonding to the paint",
    ],
    included: [
      "Full exterior decontamination wash and clay bar",
      "Machine polish to correct light defects before coating",
      "Panel wipe to strip oils so the coating bonds properly",
      "Ceramic coating applied panel by panel under inspection light",
      "Indoor cure time before the car goes back outside",
      "Aftercare guidance — how to wash it, what to avoid, and when",
    ],
    pairsWith: ["full-detail", "interior-detailing"],
    pageFaq: [
      {
        question: "How long does ceramic coating last?",
        answer:
          "A professionally prepped and applied coating typically protects for two or more years of daily driving, depending on the product tier and how the car is washed afterward. Prep is what separates a coating that lasts from one that fails early.",
      },
      {
        question: "Why does coating cost more than a detail?",
        answer:
          "Because most of the work happens before the coating is opened: decontamination, polishing, and panel wipes take the bulk of the time. The coating itself only performs as well as the paint under it.",
      },
      {
        question: "Does a coated car still need washing?",
        answer:
          "Yes — coating makes washing easier and safer for the paint, it doesn't replace it. Dirt sits on the coating instead of the paint and releases with far less effort.",
      },
    ],
  },
];

export function getAllServices(): DetailService[] {
  return services;
}

export function getServiceBySlug(slug: ServiceSlug): DetailService | undefined {
  return services.find((s) => s.slug === slug);
}
