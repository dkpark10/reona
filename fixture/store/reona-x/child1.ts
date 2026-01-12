import { html, store, countStore } from '../../../packages/reona-x/src/core/component';

export default function Child1() {
  const storeData = store(countStore);

  const trigger = () => {
    storeData.count += 1;
  }

  return html`
    <div>
      <button type="button" @click=${trigger}>trigger</button>
      ${storeData.count}
    </div>
  `;
}
