import { assert, describe, expect, expectTypeOf, it } from "vitest";
import { defaultSettings, safelyParseSettings } from "./settings.ts";

describe("Settings : safelyParseSettings() functions correctly", () => {
  it("safelyParseSettings() correctly returns defaultSettings with bad input #1", () => {
    const settings = safelyParseSettings(undefined);
    expect(settings).deep.equal(defaultSettings);
    expectTypeOf(settings).toEqualTypeOf(defaultSettings);
  });

  it("safelyParseSettings() correctly returns defaultSettings with bad input #2", () => {
    const settings = safelyParseSettings({});
    expect(settings).deep.equal(defaultSettings);
  });

  it("safelyParseSettings() correctly returns defaultSettings with bad input #3", () => {
    const settings = safelyParseSettings({ unsupportedValue: [1, 2, 3] });
    expect(settings).deep.equal(defaultSettings);
    expect(settings.unsupportedValue).toBeUndefined();
  });

  it("safelyParseSettings() correctly returns defaultSettings with bad input #4", () => {
    const settings = safelyParseSettings({ oldSettingExample: true });
    expect(settings).deep.equal(defaultSettings);
  });

  it("safelyParseSettings() correctly returns defaultSettings with modifications #1", () => {
    const settings = safelyParseSettings({
      enableDedup: !defaultSettings.enableDedup,
      invalidExample: true,
    });
    expect(settings).not.deep.equal(defaultSettings, "settings should not be equal to defaultSettings");
    expect(settings.enableDedup).not.toBe(defaultSettings.enableDedup);
  });

  it("safelyParseSettings() correctly returns defaultSettings with modifications #2", () => {
    const settings = safelyParseSettings({
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

  it("safelyParseSettings() correctly returns defaultSettings with modifications #3", () => {
    const settings = safelyParseSettings({
      textureCompressionOptions: { format: "jpeg", quality: 1, resize: [512, 512] },
      invalidExample: true,
    });
    expect(settings).not.deep.equal(defaultSettings, "settings should not be equal to defaultSettings");
    expect(settings.textureCompressionOptions.resize).not.deep.equal(defaultSettings.textureCompressionOptions.resize);
  });
});
