import { html, state, createComponent } from '../../../../packages/reona-x/src/core';
import ArrayChild from './array-child';

export default function Array() {
  const data = state({
    arr: [0, 1, 2, 3, 4],
  });

  const trigger = () => {
    data.arr = [...data.arr, data.arr.length];
  };

    return html`
      <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => createComponent(ArrayChild, {
            props: {
              value: item,
            },
            key: item,
          }))}
        </ul>
        <ul>
          ${data.arr.map((item) => html`<li>${item}</li>`)}
        </ul>
      </div>
  `;
}
