import { html, component } from "../../packages/reona2/src/core/component";

export default component({
  name: "ref",

  data() {
    return {
      a: 12,
    }
  },

  mounted() {
    console.log(this.$refs);
  },

  template() {
    return html`
      <div id="app">
        <h1 $ref="hh">h1</h1>
      </div>
    `;
  },
});
