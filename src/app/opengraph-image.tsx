import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";
import { NERO } from "@/lib/design-tokens";

export const alt = `${SITE_NAME} — Car Detailing Studio, Metro Vancouver`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: NERO.surface,
          position: "relative",
        }}
      >
        {/* Bronze reflection line — the brand's signature hairline */}
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "80px",
            width: "480px",
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${NERO.accent}, transparent)`,
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 600,
            fontFamily: "sans-serif",
            color: NERO.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "32px",
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "68px",
            fontWeight: 600,
            fontFamily: "Georgia, serif",
            color: NERO.fg,
            lineHeight: 1.1,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          One vehicle. Undivided attention.
        </div>

        {/* Description */}
        <div
          style={{
            marginTop: "28px",
            fontSize: "28px",
            fontFamily: "sans-serif",
            color: NERO.muted,
            lineHeight: 1.5,
            maxWidth: "820px",
            display: "flex",
          }}
        >
          Private, appointment-only detailing studio · Metro Vancouver
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            background: NERO.raised,
            border: `1px solid ${NERO.lineStrong}`,
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: NERO.accent,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "20px",
              color: NERO.muted,
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            Drop-off only · By appointment
          </div>
        </div>
      </div>
    ),
    size,
  );
}
