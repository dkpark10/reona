import { html, createComponent, state } from "../../../../packages/reona/src/core";

function Child({ v }: { v: number }) {
  const onClick = () => console.log(v);

  return html`<button type="button" id="child" @click=${onClick}>${v}</button>`;
}

export default function App() {
  const data = state({ v: 1 });

  const onClick = () => {
    data.v += 1;
  };

  return html`<div>
    <button type="button" id="parent" @click=${onClick}>up</button>
    ${createComponent(Child, { props: { v: data.v } })}
  </div>`;
}
