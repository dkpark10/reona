import { html, mounted, state, createComponent, updated } from '../../packages/reona-x/src/core';
import Child from './child';
import Child2 from './child2';

interface CounterProps {
  value: number;
}

export default function Counter({ value }: CounterProps) {
  const data = state({
    bool: true,
  });

  const trigger = () => {
    data.bool = !data.bool;
  };

  mounted(() => {
    console.log('mounted', document.getElementById('app'));
  });

  updated<typeof data>((next, prev) => {
    console.log(next, prev);
  });

  return html`
    <div id="app">
      <button type="button" @click=${trigger}>trigger</button>
      <div>props: ${value}</div>
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
