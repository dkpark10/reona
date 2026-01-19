import { html, state } from '../../../../packages/reona-x/src/core';

export default function Counter() {
  const data = state({
    count: 0,
  });

  const onClick = () => {
    data.count += 1;
  }

  return html`
    <section id="app">
      <button type="button" @click=${onClick}>click</button>
      <div>
        <div>카운트</div>
        <span>${data.count}</span>
      </div>
    </section>
  `;
}
