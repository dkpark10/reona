import { html } from "../../packages/reona2/src/core/html";
import { component } from "../../packages/reona2/src/core/component";
import { counterStore } from "../../packages/reona2/src/core/store";

type Method = typeof counterStore.mutation;

export default component<
  {},
  { value: number; },
  { trigger2: () => void; } & Method,
  { globalState: number; double: number; }
>({
  name: "child1",

  data() {
    return {
      value: 4,
    };
  },

  computed: {
    ...counterStore.state,

    double() {
      return this.value * 2;
    }
  },

  methods: {
    ...counterStore.mutation,

    trigger2() {
      this.value += 1;
    },
  },

  template() {
    return html`
      <div>
        <button type="button" @click=${this.trigger}>trigger</button>
        <button type="button" @click=${this.trigger2}>trigger2</button>
        <div>${this.globalState}</div>
        <div>data computed: ${this.double}</div>
      </div>
    `;
  },
});
