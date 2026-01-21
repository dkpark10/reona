import { html, state } from '../core';

export default function Counter() {
  const data = state({
    count: 0,
  });

  const increase = () => {
    data.count += 1;
  }

  const decrease = () => {
    data.count -= 1;
  }

  return html`
    <div id="app">
      <button type="button" data-testid="increase" @click=${increase}>increase</button>
      <button type="button" data-testid="decrease" @click=${decrease}>decrease</button>
      <div id="value">${data.count}</div>
    </div>
  `;
}
