import { html } from '../core';

export default function Child({ value }) {
  return html`<li>${value}</li>`;
}
