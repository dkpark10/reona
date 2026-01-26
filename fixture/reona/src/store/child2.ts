import { html, store } from '../../../../packages/reona/src/core';
import { countStore } from './count-store';

export default function Child2() {
  const storeData = store(countStore);

  return html`
    <div id="store2">${storeData.count}</div>
  `;
}
