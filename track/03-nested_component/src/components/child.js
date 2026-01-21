import { html } from '../core';

export default function Child({ value }) {
  return html`<div id="child1">${value}</div>`;
}
