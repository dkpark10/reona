import { html, ref, state } from '../../../../packages/reona-x/src/core';

export default function Ref() {
  const data = state({
    value: 0,
  })

  const unStateless = ref({
    value: 9999,
  })

  const trigger = () => {
    data.value += 1;
  }

  const noop = () => {
    unStateless.current.value += 1;
  }

  return html`
    <div id="app">
      <button type="button" data-testid="trigger" @click=${trigger}>trigger</button>
      <button type="button" data-testid="noop" @click=${noop}>noop</button>
      <div id="value">${unStateless.current.value}</div>
    </div>
  `;
}
