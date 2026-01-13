import { html, component } from '../../../packages/reona/src/core';
import { counterStore } from './count-store';

export default component<
  {},
  {},
  {},
  { globalState: number; }
>({
  name: 'child2',

  connect: [counterStore.subscribe],

  computed: {
    globalState() {
      return counterStore.state.globalState;
    },
  },

  template() {
    return html`
      <div data-testid="store2">${this.globalState}</div>
    `;
  },
});
