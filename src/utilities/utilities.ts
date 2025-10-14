/**
 * Toggles the current theme.
 * @param forceDark Force set dark mode
 * @returns themeDark boolean */
export function lazyToggleTheme(forceDark?: boolean): boolean {
  const htmlElement = document.documentElement;
  const themeDark = htmlElement.style.filter !== "invert(1)";
  htmlElement.style.filter = forceDark || themeDark ? "invert(1)" : "invert(0)";
  return themeDark;
}

export function userPrefersDarkMode(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Type predicate to check if a value is an array of exactly two numbers */
export function isTwoNumberArray(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
