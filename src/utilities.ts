export function lazyToggleTheme() {
  const htmlElement = document.documentElement;
  htmlElement.style.filter = htmlElement.style.filter !== "invert(1)" ? "invert(1)" : "invert(0)";
}
