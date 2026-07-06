import { html, createComponent, state } from "../../../../packages/reona/src/core";

function Leaf({ id }: { id: string }) {
  const data = state({ count: 0 });

  const onClick = () => {
    data.count += 1;
  };

  return html` <button type="button" data-testid=${id} @click=${onClick}>id:${id} ${data.count}</button> `;
}

function A() {
  return html` <div>
    ${createComponent(Leaf, { props: { id: 'a1' } })}
    ${createComponent(Leaf, { props: { id: 'a2' } })}
  </div>`;
}

function B() {
  return html`<div>${createComponent(Leaf, { props: { id: 'b1' } })}</div>`;
}

export default function App() {
  return html`<div>${createComponent(A)} ${createComponent(B)}</div>`;
}
