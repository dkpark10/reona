import { component, html } from '../../../packages/reona/src/core';

export default component<{
  value: number,
}>({
  name: 'array-child',

  template() {
    return html`<li>${this.$props.value * 2}</li>`;
  },
});
