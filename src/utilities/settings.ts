import type { OptimizationSettings, Setting } from "../types.ts";
import { isTwoNumberArray, userPrefersDarkMode } from "./utilities.ts";

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
    darkMode: userPrefersDarkMode(),
    showDebugPanel: false,
  },
};
// Prevent property mutation
Object.freeze(defaultSettings);

function parseSettings(settings: Partial<Setting>, newSettings: Setting = { ...defaultSettings }): Setting {
  for (const key of Object.keys(settings)) {
    const value = settings[key];
    // Check for disallowed values
    if (value === undefined || value === "") {
      throw new Error(`Validation failed: Key '${key}' with value '${value}' is a disallowed value.`);
    }
    // Apply the value only if the key exists (form of sanitization)
    if (Object.hasOwn(newSettings, key)) {
      if (typeof value === "object" && !isTwoNumberArray(value)) {
        // @ts-expect-error !isTwoNumberArray safety check covers this, then we assume object
        newSettings[key] = parseSettings(value as unknown as Setting, value);
      } else {
        newSettings[key] = value;
      }
    }
  }
  return newSettings;
}

export function safelyParseSettings(settings: unknown = {}): OptimizationSettings {
  try {
    return parseSettings(settings as Partial<OptimizationSettings>) as OptimizationSettings;
  } catch (error) {
    console.log("Could not parse input object, corrupt or outdated input Settings", {
      settings: settings,
      error: error,
    });
    // Ensure we return a new clean copy of defaults.
    return { ...defaultSettings };
  }
}
