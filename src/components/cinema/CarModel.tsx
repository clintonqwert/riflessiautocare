"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
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
 * took it from 11.2 MB to 1.14 MB (0.86 MB gzipped). See
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
  trim: StageConfig["trim"];
  /** Clearcoat pair, kept in sync with the animated ranges in PaintStage. */
  clearcoat: readonly [number, number];
  clearcoatRoughness: readonly [number, number];
  envIntensityBare: number;
}

export function CarModel({
  paintRef,
  form,
  material,
  trim,
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

  /**
   * Trim materials. The asset ships without textures, so glass, rims, tyres and
   * lamps all arrive as flat placeholder surfaces — and the glass in particular
   * arrives with `KHR_materials_transmission` and no map, which renders it
   * completely invisible. That is why the windshield looked missing.
   *
   * Plain transparency rather than transmission: it reads better against a dark
   * backdrop and skips three's separate transmission render pass, which is the
   * single most expensive thing this scene could do.
   */
  const trimMaterials = useMemo(() => {
    const glass = new MeshPhysicalMaterial({
      color: trim.glassColor,
      transparent: true,
      opacity: trim.glassOpacity,
      roughness: trim.glassRoughness,
      metalness: 0.1,
      envMapIntensity: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const rim = new MeshStandardMaterial({
      color: trim.rimColor,
      metalness: trim.rimMetalness,
      roughness: trim.rimRoughness,
      envMapIntensity: 1.5,
    });
    const tyre = new MeshStandardMaterial({
      color: trim.tyreColor,
      metalness: 0.05,
      roughness: 0.82,
      envMapIntensity: 0.3,
    });
    const lamp = (color: string) =>
      new MeshStandardMaterial({
        color,
        emissive: new Color(color),
        emissiveIntensity: trim.lightGlow,
        metalness: 0.2,
        roughness: 0.25,
      });
    return {
      glass,
      rim,
      tyre,
      head: lamp("#eaf2ff"),
      brake: lamp("#ff2d2d"),
      signal: lamp("#ff9d2e"),
      dark: new MeshStandardMaterial({
        color: "#15161a",
        metalness: 0.4,
        roughness: 0.6,
      }),
    };
  }, [trim]);

  useEffect(() => {
    const created = Object.values(trimMaterials).filter(
      (m): m is MeshStandardMaterial => m instanceof MeshStandardMaterial,
    );
    return () => created.forEach((m) => m.dispose());
  }, [trimMaterials]);

  useEffect(() => {
    scene.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const current = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const name = current?.name ?? "";

      if (PAINT_MATERIAL.test(name)) mesh.material = paint;
      else if (/glass|window/i.test(name)) mesh.material = trimMaterials.glass;
      else if (/^Rim/i.test(name)) mesh.material = trimMaterials.rim;
      else if (/tire|tyre/i.test(name)) mesh.material = trimMaterials.tyre;
      else if (/headlight/i.test(name)) mesh.material = trimMaterials.head;
      else if (/brakelight/i.test(name)) mesh.material = trimMaterials.brake;
      else if (/signallight/i.test(name)) mesh.material = trimMaterials.signal;
      else if (/mirror/i.test(name)) mesh.material = trimMaterials.rim;
      else if (/mechanical|brake|disc|interior|license/i.test(name)) {
        mesh.material = trimMaterials.dark;
      }
    });
  }, [scene, paint, trimMaterials]);

  return (
    <group scale={fit.scale} position={fit.offset}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL);
