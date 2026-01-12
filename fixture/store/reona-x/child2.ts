import { html, store, countStore } from '../../../packages/reona-x/src/core/component';

export default function Child1() {
  const storeData = store(countStore);

  return html`
    <div>
      ${storeData.count}
    </div>
  `;
}
