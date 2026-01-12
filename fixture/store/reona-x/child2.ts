import { html, store } from '../../../packages/reona-x/src/core';
import { countStore } from './count-store';

export default function Child1() {
  const storeData = store(countStore);

  return html`
    <div id="store2">${storeData.count}</div>
  `;
}
