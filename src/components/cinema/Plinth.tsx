"use client";

import { useEffect, useMemo, useRef } from "react";
import { ContactShadows } from "@react-three/drei";
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
  Object3D,
  type SpotLight as SpotLightImpl,
} from "three";
import type { StageConfig } from "./stage-config";

/**
 * The plinth the car stands on, and the downlight above it.
 *
 * Both exist to solve the same problem: before this, the car floated in an
 * undifferentiated dark field with nothing to sit on and no light source the
 * eye could locate. A lit platform reads as a showroom exhibit and gives the
 * bodywork something to reflect, which is the whole point of a paint stage.
 *
 * Everything here is static — the car never moves, only the camera does. That
 * is what makes it affordable: the contact shadow bakes on the first frame and
 * is never recomputed, and the spotlight carries no shadow map at all.
 */

/**
 * Two radial ramps drawn once into canvases.
 *
 * `falloff` is the alpha ramp: opaque at the centre, clear at the rim. Without
 * it the plinth ends in a hard circular edge that reads as a disc floating in
 * space; with it the platform dissolves into the backdrop.
 *
 * `pool` is the spotlight's footprint, used as an emissive map. It is emissive
 * rather than lit for a practical reason: the platform is near-black and the
 * scroll runs at exposures as low as 0.16, so a physical light lands on it at
 * roughly the brightness of the backdrop — measured at luma 10 against a
 * backdrop of 10, i.e. invisible. Emissive bypasses that entirely and is
 * directly tunable, which is what a stage light needs to be.
 */
function useStageTextures(): { falloff: CanvasTexture | null; pool: CanvasTexture | null } {
  return useMemo(() => {
    if (typeof document === "undefined") return { falloff: null, pool: null };

    /**
     * Greyscale only, and opaque. `alphaMap` and `emissiveMap` both read the
     * texture's *colour* channel — three.js ignores a texture's alpha channel
     * for alphaMap entirely. Writing the ramp as `rgba(255,255,255,x)` looks
     * right and silently does nothing: the colour stays white, so the map
     * evaluates to fully opaque everywhere and the disc keeps a hard rim.
     */
    const ramp = (stops: [number, string][]): CanvasTexture | null => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);
      const g = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2,
      );
      for (const [at, colour] of stops) g.addColorStop(at, colour);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new CanvasTexture(canvas);
    };

    return {
      // Reaches zero at 0.7 and stays there, so the outer third of the disc is
      // fully transparent and its rim can never be seen from any angle.
      //
      // Two earlier versions each put a hard line on screen: one held opacity
      // to 0.55 before dropping, which drew a boundary on the floor and made
      // the car look like it stood on a dais; the next faded all the way to
      // the rim, so at grazing camera angles the disc's own silhouette cut a
      // straight edge across the frame. The geometry has to end somewhere it
      // is already invisible.
      falloff: ramp([
        [0, "#f2f2f2"],
        [0.16, "#b3b3b3"],
        [0.32, "#666666"],
        [0.46, "#303030"],
        [0.58, "#0f0f0f"],
        [0.7, "#000000"],
        [1, "#000000"],
      ]),
      // Gone by 0.55, comfortably inside where the alpha has already faded, so
      // the pool never lights a part of the disc that is about to end.
      pool: ramp([
        [0, "#ffffff"],
        [0.12, "#c8c8c8"],
        [0.26, "#7d7d7d"],
        [0.4, "#3a3a3a"],
        [0.55, "#101010"],
        [0.7, "#000000"],
        [1, "#000000"],
      ]),
    };
  }, []);
}

interface PlinthProps {
  stage: StageConfig["stage"];
  /** Where the car's wheels sit — the plinth's top surface goes here. */
  groundY: number;
  /** The car's overall length, used to size the platform. */
  carLength: number;
  bronzeColor: string;
}

export function Plinth({ stage, groundY, carLength, bronzeColor }: PlinthProps) {
  const { falloff, pool } = useStageTextures();
  useEffect(
    () => () => {
      falloff?.dispose();
      pool?.dispose();
    },
    [falloff, pool],
  );

  const radius = carLength * stage.plinthScale * 0.5;

  // A spotlight aims at its `target` object, which has to live in the scene
  // graph — pointing it by position alone silently does nothing.
  const spotRef = useRef<SpotLightImpl>(null);
  const target = useMemo(() => new Object3D(), []);
  useEffect(() => {
    target.position.set(0, groundY, 0);
    if (spotRef.current) spotRef.current.target = target;
  }, [target, groundY]);

  return (
    <group>
      {/* Platform. Rotated flat; `-0.002` keeps it just below the wheels so
          the two surfaces never fight over the same pixels. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, groundY - 0.002, 0]}
      >
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial
          color={stage.plinthColor}
          metalness={stage.plinthMetalness}
          roughness={stage.plinthRoughness}
          envMapIntensity={1.1}
          emissive={stage.spotColor}
          emissiveMap={pool ?? undefined}
          emissiveIntensity={stage.poolIntensity}
          transparent
          alphaMap={falloff ?? undefined}
          side={DoubleSide}
        />
      </mesh>

      {/* Optional bronze inlay, off by default (ringWidth 0). A drawn rim
          turns the floor into a plinth: the eye reads any closed outline as
          the top face of a raised object, and the car appears to stand on a
          dais rather than on the ground. Kept only because a hard-edged
          turntable is a legitimate look if it is ever wanted deliberately. */}
      {stage.ringWidth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY + 0.001, 0]}>
          <ringGeometry args={[radius - stage.ringWidth, radius, 96]} />
          <meshStandardMaterial
            color={bronzeColor}
            metalness={0.9}
            roughness={0.3}
            emissive={bronzeColor}
            emissiveIntensity={0.18}
            transparent
            opacity={0.55}
            side={DoubleSide}
          />
        </mesh>
      )}

      {/* Baked on the first frame and never recomputed — the car is static, so
          re-rendering this every frame would be pure waste. */}
      <ContactShadows
        position={[0, groundY + 0.004, 0]}
        scale={carLength * 1.6}
        blur={stage.shadowBlur}
        opacity={stage.shadowOpacity}
        far={carLength * 0.5}
        resolution={512}
        frames={1}
        color="#000000"
      />

      {/* The downlight. No shadow map: the contact shadow above already
          grounds the car, and a second shadow pass would cost far more than it
          adds. */}
      <primitive object={target} />
      <spotLight
        ref={spotRef}
        position={[0, groundY + stage.spotHeight, 0]}
        angle={MathUtils.degToRad(stage.spotAngle)}
        penumbra={stage.spotPenumbra}
        intensity={stage.spotIntensity}
        distance={stage.spotHeight * 3}
        decay={1.6}
        color={stage.spotColor}
      />
    </group>
  );
}
