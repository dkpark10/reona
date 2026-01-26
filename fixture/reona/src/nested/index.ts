import { createComponent, html, state } from '../../../../packages/reona/src/core';
import Son from './son';

export default function App() {
  const data = state({
    count: 0,
  });

  const onClick = () => {
    data.count += 1;
  }

  return html`
    <div id="app">
      <button type="button" @click=${onClick}>트리거</button>
      <div>값: ${data.count}</div>
      ${createComponent(
        Son, {
          props: {
            value: data.count * 2,
          },
        },
      )}
    </div>`;
}