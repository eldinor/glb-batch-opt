import type { OptimizationSettings } from "./types.ts";

export const defaultSettings: OptimizationSettings = {
  enableDedup: true,
  dedupOptions: {
    accessors: true,
    meshes: true,
    materials: true,
  },
  enableTextureCompression: true,
  textureCompressionOptions: {
    format: "webp",
    quality: "auto",
    resize: [1024, 1024],
  },
  enableFlatten: true,
  enableJoin: true,
  enableWeld: true,
  enableSimplify: false, // Changed from true to false
  simplifyOptions: {
    ratio: 0.75,
    error: 0.01,
  },
  enableCenter: false,
  centerOptions: {
    pivot: "center",
  },
  enableMeshopt: false,
  meshoptOptions: {
    level: "medium",
  },
  enablePrune: true,
  pruneOptions: {
    keepExtras: true,
  },
  enableQuantize: false,
  enableResample: false,
  enableInstance: false,
  instanceOptions: {
    min: 5,
  },
  enableSparse: false,
  sparseOptions: {
    ratio: 0.1,
  },
  enablePalette: false,
  paletteOptions: {
    min: 3,
  },
  enableNormals: false,
  normalsOptions: {
    overwrite: true,
  },
  enableMetalRough: false,
  enableMaterialsOptions: false,
  materialsOptions: {
    doubleSided: false,
  },
  userSettings: {
    fileNameSuffix: "_optimized",
    maxFileNameLength: 20,
    shortenFileNames: false,
  },
};
