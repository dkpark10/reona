import { html, component } from "../../packages/reona/src/core/component";
import { counterStore } from "../../packages/reona/src/core/store";

export default component<
  {},
  { value: number; },
  { trigger: () => void; trigger2: () => void; },
  { globalState: number; double: number; }
>({
  name: "child1",

  data() {
    return {
      value: 4,
    };
  },

  // todo connect 없이 내부 추상화...
  connect: [counterStore.subscribe],

  computed: {
    globalState() {
      return counterStore.state.globalState;
    },

    double() {
      return this.value * 2;
    }
  },

  methods: {
    trigger() {
      counterStore.mutation.trigger();
    },

    trigger2() {
      this.value += 1;
    },
  },

  template() {
    return html`
      <div>
        <button type="button" data-testid="trigger" @click=${this.trigger}>trigger1</button>
        <button type="button" @click=${this.trigger2}>trigger2</button>
        <div data-testid="store1">${this.globalState}</div>
        <div>data computed: ${this.double}</div>
      </div>
    `;
  },
});
