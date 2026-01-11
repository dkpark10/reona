import { html, component, createComponent } from "../../packages/reona/src/core/component";
import condi1 from './condi1';
import condi2 from './condi2';

export default component<
  {},
  { value: number; },
  { trigger: () => void; }
>({
  data() {
    return {
      value: 0,
    };
  },

  methods: {
    trigger() {
      this.value += 1;
    },
  },

  template() {
    return html`
      <div id="app">
        <button type="button" @click=${this.trigger}>trigger</button>
        <div>${this.value}</div>
        ${this.value % 2 === 0 ? createComponent(condi1) : createComponent(condi2)}
      </div>
    `;
  },
});
