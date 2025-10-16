import { describe, it, expect, vi, afterEach } from "vitest";
import { isTwoNumberArray, userPrefersDarkMode, lazySetTheme } from "./utilities.ts";

// Reset any stubbed globals between tests
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("utilities: isTwoNumberArray()", () => {
  it("returns true for an array of exactly two numbers", () => {
    expect(isTwoNumberArray([1, 2])).toBe(true);
  });

  it("returns false for arrays with wrong length", () => {
    expect(isTwoNumberArray([])).toBe(false);
    expect(isTwoNumberArray([1])).toBe(false);
    expect(isTwoNumberArray([1, 2, 3])).toBe(false);
  });

  it("returns false for arrays with non-number elements", () => {
    expect(isTwoNumberArray(["1", 2] as unknown as [number, number])).toBe(false);
    expect(isTwoNumberArray([1, "2"] as unknown as [number, number])).toBe(false);
    expect(isTwoNumberArray(["1", "2"] as unknown as [number, number])).toBe(false);
  });

  it("returns false for non-array inputs", () => {
    expect(isTwoNumberArray("string" as unknown)).toBe(false);
    expect(isTwoNumberArray(123 as unknown)).toBe(false);
    expect(isTwoNumberArray(null as unknown)).toBe(false);
    expect(isTwoNumberArray(undefined as unknown)).toBe(false);
    expect(isTwoNumberArray({} as unknown)).toBe(false);
  });
});

describe("utilities: userPrefersDarkMode()", () => {
  it("returns false when window is undefined (Node environment)", () => {
    // No stubs — in Node test env window is typically undefined
    expect(userPrefersDarkMode()).toBe(false);
  });

  it("returns false when window exists but matchMedia is not available", () => {
    vi.stubGlobal("window", {});
    expect(userPrefersDarkMode()).toBe(false);
  });

  it("returns true when matchMedia reports dark mode", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });
    expect(userPrefersDarkMode()).toBe(true);
  });

  it("returns false when matchMedia reports light mode", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    expect(userPrefersDarkMode()).toBe(false);
  });
});

describe("utilities: lazySetTheme()", () => {
  it("sets document.documentElement.style.filter to invert(1) for dark mode", () => {
    const mockDoc = { documentElement: { style: { filter: "" } } } as unknown as Document;
    vi.stubGlobal("document", mockDoc);

    lazySetTheme(true);

    expect(document.documentElement.style.filter).toBe("invert(1)");
  });

  it("sets document.documentElement.style.filter to invert(0) for light mode", () => {
    const mockDoc = { documentElement: { style: { filter: "" } } } as unknown as Document;
    vi.stubGlobal("document", mockDoc);

    lazySetTheme(false);

    expect(document.documentElement.style.filter).toBe("invert(0)");
  });
});
