import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";
import FurnitureModel from "./FurnitureModel";

export default function FurnitureCanvas({
  modelPath,
  selectedColor,
  colorTarget,
  isRotating,
}) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        key={modelPath}
        camera={{ position: [0, 1.2, 4], fov: 40 }}
      >
        <color attach="background" args={["#e5e5e5"]} />

        <ambientLight intensity={0.55} />

        <directionalLight
          position={[3, 5, 4]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        <Bounds fit clip observe margin={1.3}>
          <FurnitureModel
            modelPath={modelPath}
            selectedColor={selectedColor}
            colorTarget={colorTarget}
            isRotating={isRotating}
          />
        </Bounds>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.05, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.28} />
        </mesh>

        <OrbitControls
          makeDefault
          target={[0, 0.8, 0]}
          enableZoom={true}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}