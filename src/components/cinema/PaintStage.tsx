"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, Vector3, type MeshPhysicalMaterial } from "three";
import { NERO } from "@/lib/design-tokens";
import { getOpeningPose } from "@/lib/content/cinema";
import { createPaintTesterGeometry } from "./paint-tester-geometry";
import { createSampledPose, samplePose } from "./pose";
import { stageProgress } from "./scroll-progress";

/** Bare corrected paint → cured ceramic coating, as the `finish` value climbs. */
const FINISH_RANGE = {
  roughness: [0.42, 0.045] as const,
  clearcoat: [0.35, 1] as const,
  clearcoatRoughness: [0.34, 0.015] as const,
  envMapIntensity: [0.9, 2.3] as const,
};

/**
 * Lighting rig intensities — the contrast dial, all in one place.
 *
 * The body stays near-black, so separation from the backdrop comes from
 * specular rather than base colour. A high key-to-fill ratio is what gives the
 * form a bright edge and a dark core instead of an evenly grey blob.
 */
const RIG = {
  key: 6.5,
  sweepLeft: 4.2,
  sweepRight: 2.6,
  bronzeRim: 4.8,
  /** Deliberately low — raising this is what flattens the whole image. */
  fill: 0.3,
};

type MaterialRef = RefObject<MeshPhysicalMaterial | null>;

/**
 * The single render-loop owner. Camera, exposure, and material all read from
 * one sample per frame — splitting them across components would resample the
 * same curve three times and invite ordering bugs.
 */
function StageDirector({ materialRef }: { materialRef: MaterialRef }) {
  const sampled = useMemo(() => createSampledPose(), []);
  const lookAt = useMemo(
    () => new Vector3(...getOpeningPose().target),
    [],
  );

  useFrame((state, delta) => {
    samplePose(stageProgress.current, sampled);

    // Frame-rate independent damping: the camera chases the scroll pose rather
    // than snapping to it, which is what keeps fast flicks from feeling jumpy.
    const alpha = 1 - Math.pow(0.0016, Math.min(delta, 0.1));

    state.camera.position.lerp(sampled.position, alpha);
    lookAt.lerp(sampled.target, alpha);
    state.camera.lookAt(lookAt);

    // Exposure is the act-to-act lighting ramp — near darkness on arrival,
    // brightest when the coating goes on.
    state.gl.toneMappingExposure = MathUtils.lerp(
      state.gl.toneMappingExposure,
      sampled.exposure,
      alpha,
    );

    const material = materialRef.current;
    if (material) {
      const f = sampled.finish;
      material.roughness = MathUtils.lerp(...FINISH_RANGE.roughness, f);
      material.clearcoat = MathUtils.lerp(...FINISH_RANGE.clearcoat, f);
      material.clearcoatRoughness = MathUtils.lerp(
        ...FINISH_RANGE.clearcoatRoughness,
        f,
      );
      material.envMapIntensity = MathUtils.lerp(
        ...FINISH_RANGE.envMapIntensity,
        f,
      );
    }
  });

  return null;
}

function PaintTester({ materialRef }: { materialRef: MaterialRef }) {
  const geometry = useMemo(() => createPaintTesterGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, -0.55, 0]}>
      {/*
        Automotive paint is pigment under a clear coat, not bare metal — so the
        base stays dark and mid-metalness while the clearcoat layer does the
        reflecting. That separation is what lets the coating beat in act six
        read as a real change in finish.

        The solid is closed and correctly wound, so it renders front-faces only.
      */}
      <meshPhysicalMaterial
        ref={materialRef}
        color={NERO.raised}
        metalness={0.65}
        roughness={FINISH_RANGE.roughness[0]}
        clearcoat={FINISH_RANGE.clearcoat[0]}
        clearcoatRoughness={FINISH_RANGE.clearcoatRoughness[0]}
        envMapIntensity={FINISH_RANGE.envMapIntensity[0]}
      />
    </mesh>
  );
}

/**
 * A showroom light rig built entirely from emissive planes, baked once into an
 * environment map. No HDR file is fetched — nothing here touches the network.
 * The long strips are the important ones: they are what sweep across the
 * crown and through the scoops as the camera travels, which is the brand's
 * whole motif. Intensities live in RIG.
 */
function ShowroomRig() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Overhead softbox — the key light. */}
      <Lightformer
        form="rect"
        intensity={RIG.key}
        position={[0, 6, 0]}
        target={[0, 0, 0]}
        scale={[10, 3, 1]}
        color="#fffaf2"
      />
      {/* Long side strips — the travelling highlights. */}
      <Lightformer
        form="rect"
        intensity={RIG.sweepLeft}
        position={[-6.5, 2.4, 2]}
        target={[0, 0, 0]}
        scale={[14, 1.2, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={RIG.sweepRight}
        position={[6.5, 2, -1.5]}
        target={[0, 0, 0]}
        scale={[12, 1, 1]}
        color={NERO.fg}
      />
      {/* Bronze rim — the brand accent, separating the form from the backdrop. */}
      <Lightformer
        form="rect"
        intensity={RIG.bronzeRim}
        position={[2.5, 1.2, -6.5]}
        target={[0, 0, 0]}
        scale={[8, 1.4, 1]}
        color={NERO.accent}
      />
      {/* Low fill so the underside reads as form rather than a void. */}
      <Lightformer
        form="rect"
        intensity={RIG.fill}
        position={[0, -3.5, 2]}
        target={[0, 0, 0]}
        scale={[10, 6, 1]}
        color="#3c3c45"
      />
    </Environment>
  );
}

/**
 * Rendered only when `useStageCapability` returns "cinematic", and only ever
 * through a dynamic import — this module and its three/drei/gsap dependencies
 * stay out of the main bundle entirely.
 */
export default function PaintStage({ active }: { active: boolean }) {
  const materialRef = useRef<MeshPhysicalMaterial | null>(null);
  const opening = getOpeningPose();

  return (
    <Canvas
      // Paused outright when the sequence is off screen — the page continues
      // for several more sections and there is no reason to keep a GPU busy.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{
        fov: 38,
        near: 0.1,
        far: 80,
        position: [...opening.position] as [number, number, number],
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = opening.exposure;
      }}
    >
      <ShowroomRig />
      <PaintTester materialRef={materialRef} />
      <StageDirector materialRef={materialRef} />
    </Canvas>
  );
}
