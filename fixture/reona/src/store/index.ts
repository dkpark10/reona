import { html, createComponent } from '../../../../packages/reona/src/core';
import Child1 from './child1';
import Child2 from './child2';

export default function Store() {
  return html`
    <div id="app">
      ${createComponent(Child1)}
      ${createComponent(Child2)}
    </div>
  `;
}
