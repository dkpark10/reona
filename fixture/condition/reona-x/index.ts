import { html, mounted, state, createComponent, updated } from '../../../packages/reona-x/src/core';
import Child from './child';
import Child2 from './child2';

export default function Condition() {
  const data = state({
    bool: true,
  });

  const trigger = () => {
    data.bool = !data.bool;
  };

  mounted(() => {
    console.log('mounted', document.getElementById('app'));
  });

  updated(data, (prev) => {
    console.log(prev);
  });

  return html`
    <div id="app">
      <button type="button" @click=${trigger}>trigger</button>
      ${data.bool ?
        createComponent(Child, {
          props: {
            value: 1,
          },
        })
        : createComponent(Child2, {
          props: {
            value: 2
          },
        })
      }
    </div>
  `;
}
