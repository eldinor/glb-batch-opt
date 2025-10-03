import { assert, describe, expect, expectTypeOf, it } from "vitest";
import { defaultSettings, loadSettings } from "./settings.ts";

describe("Settings : loadSettings() functions correctly", () => {
  it("loadSettings() correctly returns defaultSettings with bad input #1", () => {
    const settings = loadSettings(undefined);
    expect(settings).deep.equal(defaultSettings);
    expectTypeOf(settings).toEqualTypeOf(defaultSettings);
  });

  it("loadSettings() correctly returns defaultSettings with bad input #2", () => {
    const settings = loadSettings({});
    expect(settings).deep.equal(defaultSettings);
  });

  it("loadSettings() correctly returns defaultSettings with bad input #3", () => {
    const settings = loadSettings({ unsupportedValue: [1, 2, 3] });
    expect(settings).deep.equal(defaultSettings);
    expect(settings.unsupportedValue).toBeUndefined();
  });

  it("loadSettings() correctly returns defaultSettings with bad input #4", () => {
    const settings = loadSettings({ oldSettingExample: true });
    expect(settings).deep.equal(defaultSettings);
  });

  it("loadSettings() correctly returns defaultSettings with modifications #1", () => {
    const settings = loadSettings({
      enableDedup: !defaultSettings.enableDedup,
      invalidExample: true,
    });
    expect(settings).not.deep.equal(defaultSettings, "settings should not be equal to defaultSettings");
    expect(settings.enableDedup).not.toBe(defaultSettings.enableDedup);
  });

  it("loadSettings() correctly returns defaultSettings with modifications #2", () => {
    const settings = loadSettings({
      dedupOptions: {
        accessors: !defaultSettings.dedupOptions.accessors,
        meshes: !defaultSettings.dedupOptions.meshes,
        materials: !defaultSettings.dedupOptions.materials,
      },
      invalidExample: true,
    });
    expect(settings).not.deep.equal(defaultSettings, "settings should not be equal to defaultSettings");
    assert(
      settings.dedupOptions.accessors !== defaultSettings.dedupOptions.accessors,
      "accessors should be different."
    );
    assert(settings.dedupOptions.meshes !== defaultSettings.dedupOptions.meshes, "meshes should be different.");
    assert(settings.dedupOptions.materials !== defaultSettings.dedupOptions.materials, "meshes should be different.");
  });

  it("loadSettings() correctly returns defaultSettings with modifications #3", () => {
    const settings = loadSettings({
      textureCompressionOptions: { format: "jpeg", quality: 1, resize: [512, 512] },
      invalidExample: true,
    });
    expect(settings).not.deep.equal(defaultSettings, "settings should not be equal to defaultSettings");
    expect(settings.textureCompressionOptions.resize).not.deep.equal(defaultSettings.textureCompressionOptions.resize);
  });
});
