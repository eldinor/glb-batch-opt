import { assert, describe, expect, it } from "vitest";
import { defaultSettings, loadSettings } from "./settings.ts";

describe("Settings : loadSettings() functions correctly", () => {
  it("loadSettings() correctly returns defaultSettings with bad input #1", () => {
    const settings = loadSettings(undefined);
    expect(settings).deep.equal(defaultSettings);
  });

  it("loadSettings() correctly returns defaultSettings with bad input #2", () => {
    const settings = loadSettings({});
    expect(settings).deep.equal(defaultSettings);
  });

  it("loadSettings() correctly returns defaultSettings with bad input #3", () => {
    const settings = loadSettings({ unsupportedValue: [1, 2, 3] });
    expect(settings).deep.equal(defaultSettings);
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
    assert(settings !== defaultSettings, "settings should not be equal to defaultSettings.");
    assert(settings.enableDedup !== defaultSettings.enableDedup, "enableDedup should be different.");
  });

  it("loadSettings() correctly returns defaultSettings with modifications #2", () => {
    const settings = loadSettings({
      dedupOptions: {
        accessors: !defaultSettings.dedupOptions.accessors,
        meshes: !defaultSettings.dedupOptions.meshes,
      },
      invalidExample: true,
    });
    assert(settings !== defaultSettings, "settings should not be equal to defaultSettings.");
    assert(
      settings.dedupOptions.accessors !== defaultSettings.dedupOptions.accessors,
      "accessors should be different."
    );
    assert(settings.dedupOptions.meshes !== defaultSettings.dedupOptions.meshes, "meshes should be different.");
  });
});
