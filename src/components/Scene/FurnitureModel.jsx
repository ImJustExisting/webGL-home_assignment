import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export default function FurnitureModel({
  modelPath,
  selectedColor,
  colorTarget = "WOOD",
  isRotating = false,
}) {
  const { scene } = useGLTF(modelPath);
  const pivotRef = useRef();

  const { centredScene, scale } = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) return;

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    clone.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 2.4;
    const calculatedScale = maxDimension > 0 ? targetSize / maxDimension : 1;

    clone.position.set(-center.x, -box.min.y, -center.z);

    return {
      centredScene: clone,
      scale: calculatedScale,
    };
  }, [scene]);

  useEffect(() => {
    if (!selectedColor) return;

    centredScene.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      const materialName = child.material.name?.toLowerCase() || "";
      const meshName = child.name?.toLowerCase() || "";
      const target = colorTarget.toLowerCase();

      const isTargetMaterial =
        materialName.includes(target) || meshName.includes(target);

      if (isTargetMaterial) {
        child.material.color = new THREE.Color(selectedColor);
        child.material.map = null;
        child.material.needsUpdate = true;
      }
    });
  }, [centredScene, selectedColor, colorTarget]);

  useFrame((_, delta) => {
    if (isRotating && pivotRef.current) {
      pivotRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group ref={pivotRef} scale={scale} position={[0, 0, 0]}>
      <primitive object={centredScene} />
    </group>
  );
}
