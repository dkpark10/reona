import { component, html } from "../../packages/reona2/src/core/component";

export default component<
  {},
  {},
  {},
  { globalState: number; }
>({
  name: "child2",

  template() {
    return html`
      <div>
      </div>
    `;
  },
});
