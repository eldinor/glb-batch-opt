export type OptionValue = null | boolean | string | number | [number, number];
type Options = Record<string, OptionValue>;
export type Setting = Record<string, OptionValue | Options>;

/** Note: Options should only be at the top-level. */
export interface OptimizationSettings extends Setting {
  enableDedup: boolean;
  dedupOptions: {
    accessors: boolean;
    meshes: boolean;
    materials: boolean;
  };
  enableTextureCompression: boolean;
  textureCompressionOptions: {
    format: "webp" | "jpeg" | "png";
    quality: "auto" | number;
    resize: [number, number] | null;
  };
  enableFlatten: boolean;
  enableJoin: boolean;
  enableWeld: boolean;
  enableSimplify: boolean;
  simplifyOptions: {
    ratio: number;
    error: number;
  };
  enableCenter: boolean;
  centerOptions: {
    pivot: "center" | "bottom" | "origin";
  };
  enableMeshopt: boolean;
  meshoptOptions: {
    level: "high" | "medium" | "low";
  };
  enablePrune: boolean;
  pruneOptions: {
    keepExtras: boolean;
  };
  enableQuantize: boolean;
  enableResample: boolean;
  enableInstance: boolean;
  instanceOptions: {
    min: number;
  };
  enableSparse: boolean;
  sparseOptions: {
    ratio: number;
  };
  enablePalette: boolean;
  paletteOptions: {
    min: number;
  };
  enableNormals: boolean;
  normalsOptions: {
    overwrite: boolean;
  };
  enableMetalRough: boolean;
  enableMaterialsOptions: boolean;
  materialsOptions: {
    doubleSided: boolean;
  };
  userSettings: {
    fileNameSuffix: string;
    maxFileNameLength: number;
    shortenFileNames: boolean;
    darkMode: boolean;
  };
}

type NonUndefined<T> = T extends undefined ? never : T;

/**
 * RequiredPick is useful for React state Objects
 * - Disallows undefined values
 */
export type RequiredPick<T, K extends keyof T> = {
  [P in K]: NonUndefined<T[P]>;
};
