"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  MeshPhysicalMaterial,
  Vector3,
  type Mesh,
  type Object3D,
} from "three";
import type { StageConfig } from "./stage-config";

/**
 * The car itself: a licensed concept-car model, re-materialled so its paint is
 * ours rather than the model's.
 *
 * Only the geometry is used. Every texture was stripped when the asset was
 * prepared, along with the interior and the trademarked plate and logos, which
 * took it from 11.2 MB to 2.3 MB (1.3 MB gzipped). See
 * docs/maintenance/STAGE-MODEL.md for provenance and the preparation steps.
 *
 * The model is auto-fitted to `form.length` from its own bounds, so the
 * asset's native units never matter and swapping in a different car needs no
 * measurement.
 */

export const CAR_MODEL_URL = "/models/car-concept.glb";

/** Materials whose name matches this are body paint and get replaced. */
const PAINT_MATERIAL = /^Paint/i;

interface CarModelProps {
  paintRef: RefObject<MeshPhysicalMaterial | null>;
  form: StageConfig["form"];
  material: StageConfig["material"];
  /** Clearcoat pair, kept in sync with the animated ranges in PaintStage. */
  clearcoat: readonly [number, number];
  clearcoatRoughness: readonly [number, number];
  envIntensityBare: number;
}

export function CarModel({
  paintRef,
  form,
  material,
  clearcoat,
  clearcoatRoughness,
  envIntensityBare,
}: CarModelProps) {
  const { scene } = useGLTF(CAR_MODEL_URL);

  // One paint material shared by every body panel, so the coating animation in
  // StageDirector drives the whole car from a single reference.
  const paint = useMemo(() => {
    const next = new MeshPhysicalMaterial({
      color: material.color,
      metalness: material.metalness,
      roughness: material.roughnessBare,
      clearcoat: clearcoat[0],
      clearcoatRoughness: clearcoatRoughness[0],
      envMapIntensity: envIntensityBare,
    });
    return next;
  }, [
    material.color,
    material.metalness,
    material.roughnessBare,
    clearcoat,
    clearcoatRoughness,
    envIntensityBare,
  ]);

  useEffect(() => {
    paintRef.current = paint;
    return () => {
      paintRef.current = null;
      paint.dispose();
    };
  }, [paint, paintRef]);

  // Fit the car to the configured length and stand it on the origin, measured
  // from the model rather than assumed.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const scale = size.x > 0 ? form.length / size.x : 1;
    return {
      scale,
      offset: new Vector3(-centre.x * scale, -centre.y * scale, -centre.z * scale),
    };
  }, [scene, form.length]);

  useEffect(() => {
    scene.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const current = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (current && PAINT_MATERIAL.test(current.name ?? "")) {
        mesh.material = paint;
      }
    });
  }, [scene, paint]);

  return (
    <group scale={fit.scale} position={fit.offset}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL);
