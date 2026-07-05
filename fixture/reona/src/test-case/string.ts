import { html, createComponent } from '../../../../packages/reona/src/core';

function C() {
  return html`<b>C</b>`;
}

export default function App() {
  return html`<div id="wrap">hello ${createComponent(C)} world</div>`;
}
