import { component, html } from "../../packages/reona2/src/core/component";
import { counterStore } from "../../packages/reona2/src/core/store";

export default component<
  {},
  {},
  {},
  { globalState: number; }
>({
  name: "child2",

  connect: [counterStore.subscribe],

  computed: {
    globalState() {
      return counterStore.state.globalState;
    },
  },

  template() {
    return html`
      <div data-testid="store2">${this.globalState}</div>
    `;
  },
});
