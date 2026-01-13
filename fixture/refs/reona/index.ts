import { component, html } from '../../../packages/reona/src/core';

export default component({
  name: 'counter',

  mounted() {
    console.log(this.$refs.hh);
  },

  template() {
    return html`
      <div id="app">
        <h1 $$ref="hh">hh</h1>
      </div>
    `;
  },
});
