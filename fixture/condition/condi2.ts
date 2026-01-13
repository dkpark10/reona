import { component, html } from '../../packages/reona/src/core';

export default component({
  name: 'condi2',

  mounted() {
    console.log('condi2 mount');
  },

  unMounted() {
    console.log('condi2 unmounted');
  },

  template() {
    return html`
      <div>same22</div>
    `;
  },
});
