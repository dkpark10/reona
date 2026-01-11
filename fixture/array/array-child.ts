import { component, html } from "../../packages/reona2/src/core/component";

export default component<{
  value: number,
}>({
  name: "array-child",

  template() {
    return html`<li>${this.$props.value * 2}</li>`;
  },
});
