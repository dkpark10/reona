import { html } from '../../../packages/reona-x/src/core';

interface ArrayChildProps {
  value: number;
}

export default function ArrayChild({ value } : ArrayChildProps) {
  return html`<li>${value * 2}</li>`;
}
