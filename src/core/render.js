/**
 * @param {HTMLElement} container
 * @param {component} string
 * @returns {string}
 */
export function render(container, component) {
  container.innerHTML = component;
}