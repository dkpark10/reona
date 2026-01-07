import { html, component } from "../../packages/reona2/src/core/component";

export default component({
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
