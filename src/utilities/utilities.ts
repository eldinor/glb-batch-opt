export function lazySetTheme(darkMode: boolean) {
  document.documentElement.style.filter = darkMode ? "invert(1)" : "invert(0)";
}

export function userPrefersDarkMode(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false; // Default fallback
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Type predicate to check if a value is an array of exactly two numbers */
export function isTwoNumberArray(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
