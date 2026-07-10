import {
  IconDroplet,
  IconShield,
  IconSparkle,
  IconSteeringWheel,
} from "@/components/ui/icons";
import type { ServiceSlug } from "@/types/content";

/** One slug → icon map shared by the home grid and the services pages. */
export const SERVICE_ICONS: Record<
  ServiceSlug,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  "interior-detailing": IconSteeringWheel,
  "exterior-detailing": IconDroplet,
  "full-detail": IconSparkle,
  "ceramic-coating": IconShield,
};
