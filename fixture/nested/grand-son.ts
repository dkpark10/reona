import { component, html } from "../../packages/reona/src/core/component";

export default component<
  { value: number }
>({
  name:"grand-son",

  template() {
    return html`
      <div id="grand-son">
        <div>${this.$props.value * 2}</div>
      </div>
    `;
  },
});
