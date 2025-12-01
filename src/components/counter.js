import { html } from "../core/html.js";
import { ref } from "../core/reactivity.js";

export function counter() {
  const counter = ref(10);
  return html` <div>${counter.value}</div> `;
};
