import { html, component } from "../../packages/reona2/src/core/component";

export default component({
  mounted() {
    console.log('condi1 mount');
  },

  unMounted() {
    console.log('condi1 unmounted');
  },

  template() {
    return html`
      <div>same11</div>
    `;
  },
});
