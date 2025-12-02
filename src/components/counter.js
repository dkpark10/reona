import { html } from "../core/html.js";
import { state } from "../core/state.js";

export function counter() {
  const counter = state(10);

  const increase = () => {
    counter.value += 1;
  }

  const decrease = () => {
    counter.value -= 1;
  }

  return html`
    <div>
      <button type="button" @click=${increase}>증가</button>
      <button type="button" @click=${decrease}>감소</button>
      <div>${counter.value}</div>
    </div>
  `;
};
