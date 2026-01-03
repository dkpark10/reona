import { html } from "../../packages/reona2/src/core/html";
import { component } from "../../packages/reona2/src/core/component";
import { counterStore } from "../../packages/reona2/src/core/store";

type Method = typeof counterStore.mutation;

export default component<
  {},
  {},
  Method,
  { globalState: number; }
>({
  name: "child2",

  computed: {
    ...counterStore.state,
  },

  template() {
    return html`
      <div>
        <div>${this.globalState}</div>
      </div>
    `;
  },
});
