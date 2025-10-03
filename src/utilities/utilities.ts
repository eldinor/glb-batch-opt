export function lazyToggleTheme() {
  const htmlElement = document.documentElement;
  htmlElement.style.filter = htmlElement.style.filter !== "invert(1)" ? "invert(1)" : "invert(0)";
}

/** Type predicate to check if a value is an array of exactly two numbers */
export function isTwoNumberArray(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
