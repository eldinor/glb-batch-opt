import { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";

interface ModelViewerProps {
  modelUrl: string;
}

export default function ModelViewer({ modelUrl }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configure GLTF loader
    GLTFFileLoader.IncrementalLoading = false;
    GLTFFileLoader.HomogeneousCoordinates = false;
    //  GLTFFileLoader.PreserveRightHandedness = true;

    // Initialize Babylon.js engine and scene
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const createScene = () => {
      // Create a new scene
      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;

      // Add camera
      const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 0, 0), scene);
      camera.attachControl(canvasRef.current, true);
      camera.wheelPrecision = 50;
      camera.lowerRadiusLimit = 2;
      camera.upperRadiusLimit = 50;

      // Add lights
      const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      light1.intensity = 0.7;

      const light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(0, -1, 1), scene);
      light2.intensity = 0.5;

      return scene;
    };

    const scene = createScene();

    // Start the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      engine.resize();
    });

    // Clean up on unmount
    return () => {
      engine.dispose();
      window.removeEventListener("resize", () => {
        engine.resize();
      });
    };
  }, []);

  // Load model when URL changes
  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;

    // Clear previous models
    const meshesToDispose = sceneRef.current.meshes.filter((mesh) => mesh.name !== "ground" && !mesh.name.includes("light"));

    meshesToDispose.forEach((mesh) => {
      mesh.dispose();
    });

    console.log("Loading model from URL:", modelUrl);

    // Single loading approach for all URL types
    const loadModel = (url: string) => {
      BABYLON.SceneLoader.LoadAssetContainerAsync("", url, sceneRef.current, null, ".glb")
        .then((container) => {
          console.log("Model loaded successfully:", container);

          // Add all meshes to the scene
          container.addAllToScene();

          // Center and scale model to fit view
          const boundingInfo = calculateBoundingInfo(container.meshes);
          if (boundingInfo) {
            const center = boundingInfo.boundingBox.centerWorld;
            const size = boundingInfo.boundingBox.extendSize;
            const maxSize = Math.max(size.x, size.y, size.z) * 2;

            // Adjust camera position based on model size
            const camera = sceneRef.current?.cameras[0] as BABYLON.ArcRotateCamera;
            if (camera) {
              camera.setTarget(center);
              camera.radius = maxSize * 2;
            }
          }

          // If we created a temporary URL, clean it up
          if (url !== modelUrl) {
            URL.revokeObjectURL(url);
          }
        })
        .catch((error) => {
          console.error("Error loading model:", error);
        });
    };

    if (modelUrl.startsWith("blob:")) {
      // For blob URLs, we need to fetch and create a new blob to ensure proper loading
      fetch(modelUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          // Create a binary file
          const binaryFile = new Blob([arrayBuffer], { type: "application/octet-stream" });
          const binaryUrl = URL.createObjectURL(binaryFile);

          // Load the model using the binary URL
          loadModel(binaryUrl);
        })
        .catch((error) => {
          console.error("Error fetching blob:", error);
        });
    } else {
      // For regular URLs, load directly
      loadModel(modelUrl);
    }
  }, [modelUrl]);

  // Helper function to calculate bounding info for all meshes
  const calculateBoundingInfo = (meshes: BABYLON.AbstractMesh[]) => {
    if (meshes.length === 0) return null;

    let min = meshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
    let max = meshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();

    for (let i = 1; i < meshes.length; i++) {
      const meshMin = meshes[i].getBoundingInfo().boundingBox.minimumWorld;
      const meshMax = meshes[i].getBoundingInfo().boundingBox.maximumWorld;

      min = BABYLON.Vector3.Minimize(min, meshMin);
      max = BABYLON.Vector3.Maximize(max, meshMax);
    }

    const boundingInfo = new BABYLON.BoundingInfo(min, max);
    return boundingInfo;
  };

  return (
    <div className="model-viewer">
      <canvas ref={canvasRef} />
    </div>
  );
}
