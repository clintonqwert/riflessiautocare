"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, Vector3, type MeshPhysicalMaterial } from "three";
import { getOpeningPose } from "@/lib/content/cinema";
import { createPaintTesterGeometry } from "./paint-tester-geometry";
import { createSampledPose, samplePose } from "./pose";
import { stageProgress } from "./scroll-progress";
import {
  cloneStageConfig,
  stageConfig,
  subscribeToStageConfig,
  type StageConfig,
} from "./stage-config";

/**
 * Values that are not worth exposing in the tuning panel — the clearcoat layer
 * tracks roughness closely enough that a separate pair of dials adds noise
 * rather than control.
 */
const CLEARCOAT_RANGE = [0.35, 1] as const;
const CLEARCOAT_ROUGHNESS_RANGE = [0.34, 0.015] as const;
const ENV_INTENSITY_BARE = 0.9;

type MaterialRef = RefObject<MeshPhysicalMaterial | null>;

/**
 * An immutable snapshot of the config for render-time use. The live object is
 * mutated in place, which React cannot see — taking a copy on every change
 * gives components real values with real identities to depend on.
 *
 * In production nothing calls `setStageValue`, so this resolves once and never
 * updates again. Per-frame animation still reads the live object directly in
 * `StageDirector`; that is not render, so it needs no snapshot.
 */
function useStageSnapshot(): StageConfig {
  const [snapshot, setSnapshot] = useState(cloneStageConfig);
  useEffect(
    () => subscribeToStageConfig(() => setSnapshot(cloneStageConfig())),
    [],
  );
  return snapshot;
}

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

    // Read live so the tuning panel's material sliders apply on the next frame
    // without rebuilding anything.
    const { material: cfg } = stageConfig;
    const material = materialRef.current;
    if (material) {
      const f = sampled.finish;
      material.roughness = MathUtils.lerp(cfg.roughnessBare, cfg.roughnessCoated, f);
      material.clearcoat = MathUtils.lerp(...CLEARCOAT_RANGE, f);
      material.clearcoatRoughness = MathUtils.lerp(...CLEARCOAT_ROUGHNESS_RANGE, f);
      material.envMapIntensity = MathUtils.lerp(
        ENV_INTENSITY_BARE,
        cfg.envIntensityCoated,
        f,
      );
    }

    const camera = state.camera;
    if ("fov" in camera && camera.fov !== stageConfig.camera.fov) {
      camera.fov = stageConfig.camera.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function PaintTester({
  materialRef,
  form,
  material,
}: {
  materialRef: MaterialRef;
  form: StageConfig["form"];
  material: StageConfig["material"];
}) {
  // Rebuilt exactly when a form slider moves. ~19k vertices of pure
  // arithmetic, cheap enough to regenerate on drag.
  const geometry = useMemo(() => createPaintTesterGeometry(form), [form]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // The mesh is built sitting on y=0, so it has to be lifted to sit around the
  // origin the camera poses aim at. Derived from its own bounds rather than
  // hard-coded: change crownHeight in the tuner and the framing still holds.
  const centreY = useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    return box ? -(box.max.y + box.min.y) / 2 : 0;
  }, [geometry]);

  return (
    <mesh geometry={geometry} position={[0, centreY, 0]}>
      {/*
        Automotive paint is pigment under a clear coat, not bare metal — so the
        base stays dark and mid-metalness while the clearcoat layer does the
        reflecting. That separation is what lets the coating beat in act six
        read as a real change in finish.

        The solid is closed and correctly wound, so it renders front-faces only.
      */}
      <meshPhysicalMaterial
        ref={materialRef}
        color={material.color}
        metalness={material.metalness}
        roughness={material.roughnessBare}
        clearcoat={CLEARCOAT_RANGE[0]}
        clearcoatRoughness={CLEARCOAT_ROUGHNESS_RANGE[0]}
        envMapIntensity={ENV_INTENSITY_BARE}
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
function ShowroomRig({ light }: { light: StageConfig["light"] }) {
  return (
    // `frames={1}` bakes the environment once, so a light change has to remount
    // the whole rig to take effect — hence keying on the values themselves.
    <Environment
      key={Object.values(light).join("|")}
      resolution={256}
      frames={1}
    >
      {/* Overhead softbox — the key light. */}
      <Lightformer
        form="rect"
        intensity={light.key}
        position={[0, 6, 0]}
        target={[0, 0, 0]}
        scale={[10, 3, 1]}
        color={light.keyColor}
      />
      {/* Long side strips — the travelling highlights. */}
      <Lightformer
        form="rect"
        intensity={light.sweepLeft}
        position={[-6.5, 2.4, 2]}
        target={[0, 0, 0]}
        scale={[14, 1.2, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={light.sweepRight}
        position={[6.5, 2, -1.5]}
        target={[0, 0, 0]}
        scale={[12, 1, 1]}
        color={light.keyColor}
      />
      {/* Bronze rim — the brand accent, separating the form from the backdrop. */}
      <Lightformer
        form="rect"
        intensity={light.bronzeRim}
        position={[2.5, 1.2, -6.5]}
        target={[0, 0, 0]}
        scale={[8, 1.4, 1]}
        color={light.bronzeColor}
      />
      {/* Low fill so the underside reads as form rather than a void. */}
      <Lightformer
        form="rect"
        intensity={light.fill}
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
  const config = useStageSnapshot();

  return (
    <Canvas
      // Paused outright when the sequence is off screen — the page continues
      // for several more sections and there is no reason to keep a GPU busy.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{
        fov: config.camera.fov,
        near: 0.1,
        far: 80,
        position: [...opening.position] as [number, number, number],
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = opening.exposure;
      }}
    >
      <ShowroomRig light={config.light} />
      <PaintTester
        materialRef={materialRef}
        form={config.form}
        material={config.material}
      />
      <StageDirector materialRef={materialRef} />
    </Canvas>
  );
}
