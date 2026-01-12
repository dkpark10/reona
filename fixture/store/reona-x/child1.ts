import { html, store } from '../../../packages/reona-x/src/core';
import { countStore } from './count-store';

export default function Child1() {
  const storeData = store(countStore);

  const trigger = () => {
    storeData.count += 1;
  }

  return html`
    <div>
      <button type="button" @click=${trigger}>trigger</button>
      <div id="store1">${storeData.count}</div>
    </div>
  `;
}
