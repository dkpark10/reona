import { createComponent, component, html } from "../../packages/reona2/src/core/component";
import grandSon from "./grand-son";

export default component<
  { value: number }
>({
  name:"son",

  template() {
    return html`
      <div>
        <div id="son">${this.$props.value * 2}</div>
        ${createComponent(grandSon, {
          props: {
            value: this.$props.value * 2,
          },
        })}
      </div>
    `;
  },
});
