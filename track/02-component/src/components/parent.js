import { html, state, createComponent } from '../core';
import Child from './child';

export default function Counter() {
  const data = state({
    count: 0,
  });

  const onClick = () => {
    data.count += 1;
  }

  return html`
    <div id="app">
      <button type="button" @click=${onClick}>increase</button>
      <ul>
        ${createComponent(Child, {
          props: {
            value: data.count + 1,
          }
        })}
        ${createComponent(Child, {
          props: {
            value: data.count + 2,
          }
        })}
        ${createComponent(Child, {
          props: {
            value: data.count + 3,
          }
        })}
      </ul>
    </div>
  `;
}
