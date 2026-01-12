import { html, createComponent } from '../../../packages/reona-x/src/core/component';
import child1 from './child1';
import child2 from './child2';

export default function Store() {
  return html`
    <div id="app">
      ${createComponent(child1)}
      ${createComponent(child2)}
    </div>
  `;
}
