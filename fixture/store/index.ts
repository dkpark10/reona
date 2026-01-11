import { html, component, createComponent } from "../../packages/reona/src/core/component";
import child1 from "./child1";
import child2 from "./child2";

export default component({
  name: "store",

  template() {
    return html`
      <div id="app">
        ${createComponent(child1)}
        ${createComponent(child2)}
      </div>
    `;
  },
});
