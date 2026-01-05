import { html, component, createComponent } from "../../packages/reona2/src/core/component";
import timer from "./timer";

export default component<
  {},
  { value: number; },
  { trigger: () => void; }
>({
  name: "nested",

  data() {
    return {
      value: 2,
    };
  },

  methods: {
    trigger() {
      this.value += 2;
    },
  },

  template() {
    return html`
      <div id="app">
        <button type="button" @click=${this.trigger}>트리거</button>
        <div>값: ${this.value}</div>
        ${createComponent(
          timer, {
            props: {
              quantity: this.value,
            },
          },
        )}
        ${createComponent(
          timer, {
            props: {
              quantity: 12345,
            },
          },
        )}
      </div>
    `;
  },
});

