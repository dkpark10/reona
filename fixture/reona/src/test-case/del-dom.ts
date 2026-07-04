import { html, state } from "../../../../packages/reona/src/core";

export default function App() {
  const data = state({ on: true });

  const onClick = () => {
    data.on = !data.on;
  };

  return html`<div>
    <button type="button" @click=${onClick}>toggle</button>
    ${data.on ? html`<p class="x" title="t">true</p>` : html`<p>false</p>`}
  </div>`;
}
