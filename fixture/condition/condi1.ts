import { html, component } from "../../packages/reona2/src/core/component";

export default component({
  name: "condi1",

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
