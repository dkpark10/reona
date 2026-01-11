import { html, mounted, state, createComponent } from "../../packages/reona-x/src/core/component";
import Child from "./child";
import Child2 from "./child2";

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
